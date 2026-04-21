import {
  MqttConnection,
  MqttRpcRequester,
  MqttStreamReader,
  MqttStreamWriter,
  WebRtcConnection,
  WebRtcRpcRequester,
  WebRtcStreamReader,
  WebRtcStreamWriter,
  RpcRequester,
  StreamReader,
  StreamWriter,
} from '@luxai-qtrobot/magpie'

import type { MqttOptions, WebRtcOptions } from '@luxai-qtrobot/magpie'

export type SystemDescription = {
  robot_type?: string
  robot_id?: string
  sdk_version?: string
  min_sdk?: string
  max_sdk?: string
  rpc: Record<string, { transports: Record<string, { topic?: string; service?: string; qos?: number }> }>
  stream: Record<string, { direction: string; transports: Record<string, { topic?: string; service?: string; qos?: number }> }>
}

export class UnsupportedApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnsupportedApiError'
  }
}

/**
 * Abstract transport base class.
 *
 * Robot is transport-agnostic — it only talks to this interface.
 * Extend this class to implement alternative transports (ZMQ, WebSocket, local, etc.).
 *
 * @example
 * class MyTransport extends Transport {
 *   // implement getRequester, getSubscriber, getPublisher, handshake, close
 * }
 * const robot = await Robot.connect(new MyTransport(...))
 */
export abstract class Transport {
  abstract readonly robotId: string

  /**
   * Transport key used to select the correct topic/address from the
   * robot's system description.  Must match a key in the `transports`
   * map returned by the robot (e.g. `"mqtt"`, `"webrtc"`).
   */
  abstract readonly transportKey: string

  /** Perform the system-describe handshake and return the robot's capability description. */
  abstract handshake(sdkVersion: string, timeoutSec: number): Promise<SystemDescription>

  /** Return an RPC requester for the given resolved topic/address. */
  abstract getRequester(topic: string): RpcRequester

  /** Return a stream reader for the given resolved topic/address. */
  abstract getSubscriber(topic: string, qos?: number, queueSize?: number): StreamReader

  /** Return a stream writer. */
  abstract getPublisher(): StreamWriter

  /** Close all resources held by this transport. */
  abstract close(): void
}

// ─── MQTT transport ──────────────────────────────────────────────────────────

export class MqttTransport extends Transport {
  readonly transportKey = 'mqtt'
  private _requesters = new Map<string, MqttRpcRequester>()
  private readonly _connectTimeoutSec: number

  constructor(
    private readonly _conn: MqttConnection,
    readonly robotId: string,
    connectTimeoutSec = 10,
  ) {
    super()
    this._connectTimeoutSec = connectTimeoutSec
  }

  async handshake(sdkVersion: string, timeoutSec: number): Promise<SystemDescription> {
    const requester = this._getOrCreateRequester(this.robotId, timeoutSec)
    const raw = await requester.call(
      { name: '/robot/system/describe', args: { sdk_version: sdkVersion } },
      timeoutSec,
    ) as { status: boolean; response: SystemDescription }
    if (!raw?.status) throw new Error('Robot: system describe returned status=false')
    return raw.response
  }

  getRequester(topic: string): RpcRequester {
    return this._getOrCreateRequester(topic, 2.0)
  }

  getSubscriber(topic: string, qos?: number, queueSize?: number): StreamReader {
    return new MqttStreamReader(this._conn, { topic, qos: qos as 0 | 1 | 2 | undefined, queueSize })
  }

  getPublisher(): StreamWriter {
    return new MqttStreamWriter(this._conn)
  }

  close(): void {
    for (const req of this._requesters.values()) req.close()
    this._requesters.clear()
    this._conn.disconnect()
  }

  private _getOrCreateRequester(topic: string, ackTimeout = 2.0): MqttRpcRequester {
    let req = this._requesters.get(topic)
    if (!req) {
      req = new MqttRpcRequester(this._conn, topic, { ackTimeout })
      this._requesters.set(topic, req)
    }
    return req
  }

  static async create(
    brokerUrl: string,
    robotId: string,
    options?: MqttOptions,
    connectTimeoutMs = 10_000,
  ): Promise<MqttTransport> {
    const suffix = Math.random().toString(36).slice(2, 8)
    const conn = new MqttConnection(brokerUrl, { ...options, clientId: `qtrobot-sdk-${robotId}-${suffix}` })
    await conn.connect(connectTimeoutMs)
    return new MqttTransport(conn, robotId, connectTimeoutMs / 1000)
  }
}

// ─── WebRTC signaling params ─────────────────────────────────────────────────

export type WebRtcSignalingParams = {
  brokerUrl: string
  mqttOptions?: MqttOptions
  webrtcOptions?: WebRtcOptions
  reconnect: boolean
  connectTimeoutSec: number
}

// ─── WebRTC transport ─────────────────────────────────────────────────────────

export class WebRtcTransport extends Transport {
  readonly transportKey = 'webrtc'
  readonly signalingParams: WebRtcSignalingParams
  private _requesters = new Map<string, WebRtcRpcRequester>()
  get connection(): WebRtcConnection { return this._conn }

  constructor(
    private readonly _conn: WebRtcConnection,
    readonly robotId: string,
    signalingParams: WebRtcSignalingParams,
  ) {
    super()
    this.signalingParams = signalingParams
  }

  async handshake(sdkVersion: string, timeoutSec: number): Promise<SystemDescription> {
    const requester = this._getOrCreateRequester('/robot/system/describe')
    const raw = await requester.call(
      { sdk_version: sdkVersion },
      timeoutSec,
    ) as { status: boolean; response: SystemDescription }
    if (!raw?.status) throw new Error('Robot: system describe returned status=false')
    return raw.response
  }

  getRequester(topic: string): RpcRequester {
    return this._getOrCreateRequester(topic)
  }

  getSubscriber(topic: string, _qos?: number, queueSize?: number): StreamReader {
    return new WebRtcStreamReader(this._conn, topic, queueSize)
  }

  getPublisher(): StreamWriter {
    return new WebRtcStreamWriter(this._conn)
  }

  close(): void {
    for (const req of this._requesters.values()) req.close()
    this._requesters.clear()
    this._conn.disconnect()
  }

  private _getOrCreateRequester(serviceName: string): WebRtcRpcRequester {
    let req = this._requesters.get(serviceName)
    if (!req) {
      req = new WebRtcRpcRequester(this._conn, serviceName)
      this._requesters.set(serviceName, req)
    }
    return req
  }

  /**
   * Create a WebRtcTransport connected via MQTT signaling.
   *
   * @param brokerUrl        MQTT broker URI for signaling (e.g. `wss://broker:8884/mqtt`)
   * @param sessionId        WebRTC session identifier — `robotId` for the robot peer,
   *                         `nodeId` for a plugin peer
   * @param signalingParams  Full signaling config stored for plugin inheritance
   * @param preConnect       Optional callback invoked after the MQTT signaling connection
   *                         is established but before WebRTC negotiation begins.
   *                         Use this to call `conn.sendVideoTrack()` / `conn.sendAudioTrack()`
   *                         before `connect()` is called.
   */
  static async create(
    brokerUrl: string,
    sessionId: string,
    signalingParams: WebRtcSignalingParams,
    preConnect?: (conn: WebRtcConnection) => void | Promise<void>,
  ): Promise<WebRtcTransport> {
    const conn = await WebRtcConnection.withMqtt(brokerUrl, sessionId, {
      clientId: `qtrobot-sdk-${sessionId}-${Math.random().toString(36).slice(2, 8)}`,
      mqttOptions: signalingParams.mqttOptions,
      reconnect: signalingParams.reconnect,
      webrtcOptions: signalingParams.webrtcOptions,
    })
    if (preConnect) await preConnect(conn)
    const connected = await conn.connect(signalingParams.connectTimeoutSec)
    if (!connected) {
      await conn.disconnect()
      throw new Error(`WebRtcTransport: failed to connect to '${sessionId}' within ${signalingParams.connectTimeoutSec}s`)
    }
    return new WebRtcTransport(conn, sessionId, signalingParams)
  }
}
