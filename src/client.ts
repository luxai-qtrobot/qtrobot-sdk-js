import type { MqttOptions, WebRtcOptions } from '@luxai-qtrobot/magpie'
import { Transport, MqttTransport, WebRtcTransport, WebRtcSignalingParams, SystemDescription, UnsupportedApiError } from './transport'
import { TypedStreamReader, TypedStreamWriter, FrameFactory, FrameSerializer } from './streams'
import { RobotApiError } from './actions'
import { TtsApi } from './api/tts'
import { FaceApi } from './api/face'
import { GestureApi } from './api/gesture'
import { MotorApi } from './api/motor'
import { MicrophoneApi } from './api/microphone'
import { MediaApi } from './api/media'
import { SpeakerApi } from './api/speaker'
import { CameraApi } from './api/camera'

const SDK_VERSION = '0.1.0'

export type ConnectOptions = MqttOptions & {
  connectTimeoutSec?: number
  defaultRpcTimeoutSec?: number
}

export type ConnectWebrtcMqttOptions = {
  mqttOptions?: MqttOptions
  webrtcOptions?: WebRtcOptions
  reconnect?: boolean
  connectTimeoutSec?: number
  defaultRpcTimeoutSec?: number
}

// ─── Route entry — transport-aware ───────────────────────────────────────────

type RpcRoute = {
  transport: Transport
  topic: string
}

type StreamRoute = {
  transport: Transport
  topic: string
  qos?: number
  direction?: 'in' | 'out'
}

// ─── Robot ────────────────────────────────────────────────────────────────────

export class Robot {
  readonly robotId: string
  readonly robotType: string | null
  readonly sdkVersion: string | null
  readonly minSdk: string | null
  readonly maxSdk: string | null

  // Core API namespaces
  readonly tts: TtsApi
  readonly face: FaceApi
  readonly gesture: GestureApi
  readonly motor: MotorApi
  readonly microphone: MicrophoneApi
  readonly media: MediaApi
  readonly speaker: SpeakerApi

  // Plugin API namespaces (set by enablePlugin / enablePluginMqtt)
  private _camera?: CameraApi
  get camera(): CameraApi | undefined { return this._camera }

  private readonly _transport: Transport
  private readonly _rpcRoutes: Map<string, RpcRoute> = new Map()
  private readonly _streamRoutes: Map<string, StreamRoute> = new Map()
  private readonly _defaultRpcTimeoutSec: number | undefined
  private readonly _pluginTransports: Map<string, Transport> = new Map()

  private constructor(
    transport: Transport,
    desc: SystemDescription,
    defaultRpcTimeoutSec?: number,
  ) {
    this._transport = transport
    this._defaultRpcTimeoutSec = defaultRpcTimeoutSec

    // Parse metadata
    this.robotId    = desc.robot_id   ?? transport.robotId
    this.robotType  = desc.robot_type ?? null
    this.sdkVersion = desc.sdk_version ?? null
    this.minSdk     = desc.min_sdk    ?? null
    this.maxSdk     = desc.max_sdk    ?? null

    // Build route tables
    this._applyDescription(transport, desc)

    // Attach API namespaces
    this.tts        = new TtsApi(this)
    this.face       = new FaceApi(this)
    this.gesture    = new GestureApi(this)
    this.motor      = new MotorApi(this)
    this.microphone = new MicrophoneApi(this)
    this.media      = new MediaApi(this)
    this.speaker    = new SpeakerApi(this)
  }

  // ─── Connection helpers ───────────────────────────────────────────────────

  /**
   * Low-level constructor — connect using any Transport implementation.
   *
   * Most users should prefer {@link connectMqtt}.
   *
   * @example
   * const robot = await Robot.connect(new MyCustomTransport(...))
   */
  static async connect(transport: Transport, options?: Pick<ConnectOptions, 'connectTimeoutSec' | 'defaultRpcTimeoutSec'>): Promise<Robot> {
    const timeoutSec = options?.connectTimeoutSec ?? 10
    const desc = await transport.handshake(SDK_VERSION, timeoutSec)
    return new Robot(transport, desc, options?.defaultRpcTimeoutSec)
  }

  /**
   * Connect to a QTrobot via MQTT broker.
   *
   * @param brokerUrl MQTT broker URL, e.g. `mqtt://192.168.1.1:1883` or `wss://broker:8884/mqtt`
   * @param robotId   Robot serial number, e.g. `"QTRD000320"`
   * @param options   Optional MQTT connection options and SDK defaults
   *
   * @example
   * const robot = await Robot.connectMqtt('mqtt://192.168.1.1:1883', 'QTRD000320')
   * await robot.tts.sayText({ text: 'Hello!' })
   * robot.close()
   */
  static async connectMqtt(brokerUrl: string, robotId: string, options?: ConnectOptions): Promise<Robot> {
    const connectTimeoutMs = (options?.connectTimeoutSec ?? 10) * 1000
    const transport = await MqttTransport.create(brokerUrl, robotId, options, connectTimeoutMs)
    try {
      return await Robot.connect(transport, options)
    } catch (err) {
      transport.close()
      throw err
    }
  }

  /**
   * Connect to a QTrobot via WebRTC with MQTT signaling.
   *
   * Each call establishes an independent WebRTC peer connection.  The
   * signaling parameters are stored on the transport so that plugin peers
   * created with {@link enablePluginWebrtcMqtt} can inherit them automatically.
   *
   * @param brokerUrl  MQTT broker URI used for WebRTC signaling,
   *                   e.g. `wss://broker:8884/mqtt`
   * @param robotId    Robot identifier (used as WebRTC `session_id`), e.g. `"QTRD000320"`
   * @param options    Optional MQTT/WebRTC/ICE options and SDK defaults
   *
   * @example
   * const robot = await Robot.connectWebrtcMqtt('wss://broker:8884/mqtt', 'QTRD000320')
   * await robot.tts.sayText({ text: 'Hello!' })
   * robot.close()
   */
  static async connectWebrtcMqtt(brokerUrl: string, robotId: string, options?: ConnectWebrtcMqttOptions): Promise<Robot> {
    const connectTimeoutSec = options?.connectTimeoutSec ?? 30
    const signalingParams: WebRtcSignalingParams = {
      brokerUrl,
      mqttOptions: options?.mqttOptions,
      webrtcOptions: options?.webrtcOptions,
      reconnect: options?.reconnect ?? false,
      connectTimeoutSec,
    }
    const transport = await WebRtcTransport.create(brokerUrl, robotId, signalingParams)
    try {
      return await Robot.connect(transport, { connectTimeoutSec, defaultRpcTimeoutSec: options?.defaultRpcTimeoutSec })
    } catch (err) {
      transport.close()
      throw err
    }
  }

  // ─── RPC call (transport-aware) ───────────────────────────────────────────

  /**
   * Call an RPC service on the robot.
   *
   * @param serviceName Canonical service path, e.g. `"/tts/engine/say/text"`
   * @param args        Arguments dict to pass to the service (undefined values are stripped)
   * @param timeoutSec  Optional timeout in seconds (overrides SDK default)
   */
  async rpcCall<T = unknown>(
    serviceName: string,
    args: Record<string, unknown>,
    timeoutSec?: number,
  ): Promise<T> {
    const route = this._rpcRoutes.get(serviceName)
    if (!route) throw new UnsupportedApiError(`Service '${serviceName}' is not available on this robot`)

    const requester = route.transport.getRequester(route.topic)
    const timeout = timeoutSec ?? this._defaultRpcTimeoutSec

    // Strip undefined values so the wire dict stays clean
    const filteredArgs = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined))
    const raw = await requester.call(filteredArgs, timeout) as { status: boolean; response: T }

    if (!raw?.status) {
      throw new RobotApiError(`Service '${serviceName}' returned status=false`)
    }
    return raw.response
  }

  // ─── Stream helpers (transport-aware) ────────────────────────────────────

  /**
   * Open a typed stream reader for a canonical stream topic.
   *
   * @param canonicalTopic  Topic path from the IDL, e.g. `"/motor/joints/state/stream:o"`
   * @param factory         Function that converts the raw deserialized dict to the frame type
   * @param queueSize       Internal frame buffer size (overrides IDL default)
   */
  getStreamReader<T>(canonicalTopic: string, factory: FrameFactory<T>, queueSize?: number): TypedStreamReader<T> {
    const route = this._streamRoutes.get(canonicalTopic)
    if (!route) throw new UnsupportedApiError(`Stream '${canonicalTopic}' is not available on this robot`)
    if (route.direction === 'in') {
      throw new UnsupportedApiError(`Stream '${canonicalTopic}' is an inbound stream — use getStreamWriter`)
    }

    const reader = route.transport.getSubscriber(route.topic, route.qos, queueSize)
    return new TypedStreamReader<T>(reader, factory)
  }

  /**
   * Open a typed stream writer for a canonical stream topic.
   *
   * @param canonicalTopic  Topic path from the IDL, e.g. `"/motor/joints/command/stream:i"`
   * @param serializer      Function that converts the frame to a wire dict
   */
  getStreamWriter<T>(canonicalTopic: string, serializer: FrameSerializer<T>): TypedStreamWriter<T> {
    const route = this._streamRoutes.get(canonicalTopic)
    if (!route) throw new UnsupportedApiError(`Stream '${canonicalTopic}' is not available on this robot`)
    if (route.direction === 'out') {
      throw new UnsupportedApiError(`Stream '${canonicalTopic}' is an outbound stream — use getStreamReader`)
    }

    const writer = route.transport.getPublisher()
    return new TypedStreamWriter<T>(writer, route.topic, serializer)
  }

  // ─── Plugin helpers ───────────────────────────────────────────────────────

  /**
   * Low-level plugin enabler — attach a plugin using any Transport.
   *
   * Most users should prefer {@link enablePluginMqtt}.
   *
   * @param name      Plugin identifier (`"camera"`)
   * @param transport An already-connected Transport for the plugin node
   * @param options   SDK defaults for the plugin connection
   *
   * @example
   * await robot.enablePlugin('camera', new MyCustomTransport(...))
   */
  async enablePlugin(
    name: 'camera',
    transport: Transport,
    options?: Pick<ConnectOptions, 'connectTimeoutSec'>,
  ): Promise<void> {
    this.disablePlugin(name)

    const timeoutSec = options?.connectTimeoutSec ?? 10
    const desc = await transport.handshake(SDK_VERSION, timeoutSec)

    // Merge plugin routes — each route carries its own transport reference
    this._applyDescription(transport, desc)

    this._pluginTransports.set(name, transport)

    // Attach plugin API namespace
    if (name === 'camera') this._camera = new CameraApi(this)
  }

  /**
   * Connect to a remote plugin node via MQTT and attach its API namespace.
   *
   * Currently supported plugin names: `"camera"`
   *
   * @param name            Plugin identifier — determines which API property is populated
   * @param brokerUrl       MQTT broker URL (can be the same broker as the robot)
   * @param mqttTopicPrefix MQTT topic prefix the plugin is accessible under
   * @param options         Optional MQTT + timeout options
   *
   * @example
   * await robot.enablePluginMqtt('camera', 'mqtt://broker:1883', 'QTRD000320/realsense')
   * const intrinsics = await robot.camera!.getColorIntrinsics()
   */
  async enablePluginMqtt(
    name: 'camera',
    brokerUrl: string,
    mqttTopicPrefix: string,
    options?: ConnectOptions,
  ): Promise<void> {
    const connectTimeoutMs = (options?.connectTimeoutSec ?? 10) * 1000
    const transport = await MqttTransport.create(brokerUrl, mqttTopicPrefix, options, connectTimeoutMs)
    try {
      await this.enablePlugin(name, transport, options)
    } catch (err) {
      transport.close()
      throw err
    }
  }

  /**
   * Connect to a remote plugin node via WebRTC (MQTT signaling) and attach its API namespace.
   *
   * Signaling parameters (`brokerUrl`, `mqttOptions`, `webrtcOptions`, `reconnect`,
   * `connectTimeoutSec`) are optional — if omitted they are inherited from the robot's own
   * WebRTC connection.  Pass explicit values to target a different broker or gateway.
   *
   * Each plugin gets its own independent WebRTC peer connection so that media tracks
   * never conflict with the robot peer.
   *
   * **Requires** that the robot was connected with {@link connectWebrtcMqtt}.
   *
   * @param name      Plugin identifier (`"camera"`)
   * @param nodeId    Plugin's WebRTC `session_id` (e.g. `"qtrobot-realsense-driver"`)
   * @param options   Optional overrides; falls back to the robot transport's signaling params
   *
   * @example
   * // Inherits broker + options from robot connection automatically
   * await robot.enablePluginWebrtcMqtt('camera', 'qtrobot-realsense-driver')
   * const intrinsics = await robot.camera!.getColorIntrinsics()
   */
  async enablePluginWebrtcMqtt(
    name: 'camera',
    nodeId: string,
    options?: {
      brokerUrl?: string
      mqttOptions?: MqttOptions
      webrtcOptions?: WebRtcOptions
      reconnect?: boolean
      connectTimeoutSec?: number
    },
  ): Promise<void> {
    if (!(this._transport instanceof WebRtcTransport)) {
      throw new Error(
        'enablePluginWebrtcMqtt requires a WebRTC robot connection — use Robot.connectWebrtcMqtt()',
      )
    }
    const inherited = this._transport.signalingParams
    const signalingParams: WebRtcSignalingParams = {
      brokerUrl:        options?.brokerUrl        ?? inherited.brokerUrl,
      mqttOptions:      options?.mqttOptions       ?? inherited.mqttOptions,
      webrtcOptions:    options?.webrtcOptions     ?? inherited.webrtcOptions,
      reconnect:        options?.reconnect         ?? inherited.reconnect,
      connectTimeoutSec: options?.connectTimeoutSec ?? inherited.connectTimeoutSec,
    }
    const transport = await WebRtcTransport.create(signalingParams.brokerUrl, nodeId, signalingParams)
    try {
      await this.enablePlugin(name, transport, { connectTimeoutSec: signalingParams.connectTimeoutSec })
    } catch (err) {
      transport.close()
      throw err
    }
  }

  /** Disconnect and remove a plugin. */
  disablePlugin(name: 'camera'): void {
    const transport = this._pluginTransports.get(name)
    if (!transport) return
    transport.close()
    this._pluginTransports.delete(name)
    if (name === 'camera') this._camera = undefined
  }

  /** Close the robot connection and release all resources. */
  close(): void {
    for (const transport of this._pluginTransports.values()) transport.close()
    this._pluginTransports.clear()
    this._transport.close()
  }

  /** Support for `using` statement (TC39 explicit resource management). */
  [Symbol.dispose](): void {
    this.close()
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────

  private _applyDescription(transport: Transport, desc: SystemDescription): void {
    const key = transport.transportKey
    for (const [service, meta] of Object.entries(desc.rpc ?? {})) {
      const t = meta.transports?.[key]
      if (t?.topic) this._rpcRoutes.set(service, { transport, topic: t.topic })
    }
    for (const [topic, meta] of Object.entries(desc.stream ?? {})) {
      const m = meta as { direction?: string; transports?: Record<string, { topic: string; qos?: number }> }
      const t = m.transports?.[key]
      const direction = m.direction as 'in' | 'out' | undefined
      if (t?.topic) this._streamRoutes.set(topic, { transport, topic: t.topic, qos: t.qos, direction })
    }
  }
}
