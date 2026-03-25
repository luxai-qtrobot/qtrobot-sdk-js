import {
  MqttConnection,
  MqttRpcRequester,
  MqttSubscriber,
  MqttPublisher,
  RpcRequester,
  StreamReader,
  StreamWriter,
} from '@luxai-qtrobot/magpie'

import type { MqttOptions } from '@luxai-qtrobot/magpie'

export type SystemDescription = {
  robot_type?: string
  robot_id?: string
  sdk_version?: string
  min_sdk?: string
  max_sdk?: string
  rpc: Record<string, { transports: Record<string, { topic: string; qos?: number }> }>
  stream: Record<string, { direction: string; transports: Record<string, { topic: string; qos?: number }> }>
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

  /** Perform the system-describe handshake and return the robot's capability description. */
  abstract handshake(sdkVersion: string, timeoutSec: number): Promise<SystemDescription>

  /** Return an RPC requester for the given resolved topic/address. */
  abstract getRequester(topic: string): RpcRequester

  /** Return a stream reader (subscriber) for the given resolved topic/address. */
  abstract getSubscriber(topic: string, qos?: number, queueSize?: number): StreamReader

  /** Return a stream writer (publisher). */
  abstract getPublisher(): StreamWriter

  /** Close all resources held by this transport. */
  abstract close(): void
}

// ─── MQTT transport ──────────────────────────────────────────────────────────

export class MqttTransport extends Transport {
  private _requesters = new Map<string, MqttRpcRequester>()

  constructor(
    private readonly _conn: MqttConnection,
    readonly robotId: string,
  ) {
    super()
  }

  async handshake(sdkVersion: string, timeoutSec: number): Promise<SystemDescription> {
    const requester = this._getOrCreateRequester(this.robotId)
    const raw = await requester.call({ sdk_version: sdkVersion }, timeoutSec) as {
      status: boolean
      response: SystemDescription
    }
    if (!raw?.status) throw new Error('Robot: system describe returned status=false')
    return raw.response
  }

  getRequester(topic: string): RpcRequester {
    return this._getOrCreateRequester(topic)
  }

  getSubscriber(topic: string, qos?: number, queueSize?: number): StreamReader {
    return new MqttSubscriber(this._conn, { topic, qos: qos as 0 | 1 | 2 | undefined, queueSize })
  }

  getPublisher(): StreamWriter {
    return new MqttPublisher(this._conn)
  }

  close(): void {
    for (const req of this._requesters.values()) req.close()
    this._requesters.clear()
    this._conn.disconnect()
  }

  private _getOrCreateRequester(topic: string): MqttRpcRequester {
    let req = this._requesters.get(topic)
    if (!req) {
      req = new MqttRpcRequester(this._conn, topic)
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
    const conn = new MqttConnection(brokerUrl, { ...options, clientId: `qtrobot-sdk-${robotId}` })
    await conn.connect(connectTimeoutMs)
    return new MqttTransport(conn, robotId)
  }
}
