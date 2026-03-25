import { Logger } from '@luxai-qtrobot/magpie'
import type { MqttOptions } from '@luxai-qtrobot/magpie'
import { MqttTransport, RouteMeta, SystemDescription, UnsupportedApiError } from './transport'
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

  // Plugin API namespaces (set by enablePlugin)
  private _camera?: CameraApi
  get camera(): CameraApi | undefined { return this._camera }

  private readonly _transport: MqttTransport
  private readonly _rpcRoutes: Map<string, RouteMeta>
  private readonly _streamRoutes: Map<string, RouteMeta>
  private readonly _defaultRpcTimeoutSec: number | undefined
  private readonly _plugins: Map<string, MqttTransport> = new Map()

  private constructor(
    transport: MqttTransport,
    desc: SystemDescription,
    defaultRpcTimeoutSec?: number,
  ) {
    this._transport = transport
    this._defaultRpcTimeoutSec = defaultRpcTimeoutSec
    this._rpcRoutes = new Map()
    this._streamRoutes = new Map()

    // Parse metadata
    this.robotId    = desc.robot_id   ?? transport.robotId
    this.robotType  = desc.robot_type ?? null
    this.sdkVersion = desc.sdk_version ?? null
    this.minSdk     = desc.min_sdk    ?? null
    this.maxSdk     = desc.max_sdk    ?? null

    // SDK version compatibility check
    if (this.minSdk && SDK_VERSION < this.minSdk) {
      Logger.warning(`Robot: SDK version ${SDK_VERSION} may be too old — robot requires >=${this.minSdk}`)
    }
    if (this.maxSdk && SDK_VERSION > this.maxSdk) {
      Logger.warning(`Robot: SDK version ${SDK_VERSION} may be too new — robot tested up to ${this.maxSdk}`)
    }

    // Build route tables
    for (const [service, meta] of Object.entries(desc.rpc ?? {})) {
      const mqtt = meta.transports?.mqtt
      if (mqtt?.topic) this._rpcRoutes.set(service, { mqtt })
    }
    for (const [topic, meta] of Object.entries(desc.stream ?? {})) {
      const mqtt = (meta as { direction?: string; transports?: { mqtt?: { topic: string; qos?: number } } }).transports?.mqtt
      const direction = (meta as { direction?: string }).direction as 'in' | 'out' | undefined
      if (mqtt?.topic) this._streamRoutes.set(topic, { mqtt, direction })
    }

    // Attach API namespaces
    this.tts        = new TtsApi(this)
    this.face       = new FaceApi(this)
    this.gesture    = new GestureApi(this)
    this.motor      = new MotorApi(this)
    this.microphone = new MicrophoneApi(this)
    this.media      = new MediaApi(this)
    this.speaker    = new SpeakerApi(this)
  }

  /**
   * Connect to a QTrobot via MQTT broker.
   *
   * @param brokerUrl MQTT broker URL, e.g. `mqtt://192.168.1.1:1883` or `wss://broker:8884/mqtt`
   * @param robotId   Robot serial number, e.g. `"QTRD000320"`
   * @param options   Optional MQTT connection options and SDK defaults
   *
   * @example
   * const robot = await Robot.connect('mqtt://192.168.1.1:1883', 'QTRD000320')
   * await robot.tts.sayText('Hello!')
   * robot.close()
   */
  static async connect(brokerUrl: string, robotId: string, options?: ConnectOptions): Promise<Robot> {
    const connectTimeoutMs = (options?.connectTimeoutSec ?? 10) * 1000
    const transport = await MqttTransport.create(brokerUrl, robotId, options, connectTimeoutMs)
    const desc = await transport.handshake(SDK_VERSION, options?.connectTimeoutSec ?? 10)
    return new Robot(transport, desc, options?.defaultRpcTimeoutSec)
  }

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

    const requester = this._transport.getRequester(route.mqtt.topic)
    const timeout = timeoutSec ?? this._defaultRpcTimeoutSec

    // Strip undefined values so the wire dict stays clean
    const filteredArgs = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined))
    const raw = await requester.call(filteredArgs, timeout) as { status: boolean; response: T }

    if (!raw?.status) {
      throw new RobotApiError(`Service '${serviceName}' returned status=false`)
    }
    return raw.response
  }

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

    const subscriber = this._transport.getSubscriber(route.mqtt.topic, route.mqtt.qos, queueSize)
    return new TypedStreamReader<T>(subscriber, factory)
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

    const publisher = this._transport.getPublisher()
    return new TypedStreamWriter<T>(publisher, route.mqtt.topic, serializer)
  }

  /**
   * Connect to a remote plugin node via MQTT and attach its API namespace.
   *
   * Currently supported plugin names: `"camera"`
   *
   * @param name            Plugin identifier — determines which API property is populated
   * @param brokerUrl       MQTT broker URL (can be the same broker as the robot)
   * @param mqttTopicPrefix MQTT topic prefix the plugin is accessible under
   *
   * @example
   * await robot.enablePlugin('camera', 'mqtt://broker:1883', 'QTRD000320/realsense')
   * const intrinsics = await robot.camera!.getColorIntrinsics()
   */
  async enablePlugin(
    name: 'camera',
    brokerUrl: string,
    mqttTopicPrefix: string,
    options?: ConnectOptions,
  ): Promise<void> {
    if (this._plugins.has(name)) this.disablePlugin(name)

    const connectTimeoutMs = (options?.connectTimeoutSec ?? 10) * 1000
    const pluginTransport = await MqttTransport.create(brokerUrl, mqttTopicPrefix, options, connectTimeoutMs)
    const desc = await pluginTransport.handshake(SDK_VERSION, options?.connectTimeoutSec ?? 10)

    // Merge plugin routes into the main route tables
    for (const [service, meta] of Object.entries(desc.rpc ?? {})) {
      const mqtt = meta.transports?.mqtt
      if (mqtt?.topic) this._rpcRoutes.set(service, { mqtt })
    }
    for (const [topic, meta] of Object.entries(desc.stream ?? {})) {
      const mqtt = (meta as { direction?: string; transports?: { mqtt?: { topic: string; qos?: number } } }).transports?.mqtt
      const direction = (meta as { direction?: string }).direction as 'in' | 'out' | undefined
      if (mqtt?.topic) this._streamRoutes.set(topic, { mqtt, direction })
    }

    this._plugins.set(name, pluginTransport)

    // Attach plugin API namespace
    if (name === 'camera') this._camera = new CameraApi(this)
  }

  /** Disconnect and remove a plugin. */
  disablePlugin(name: 'camera'): void {
    const transport = this._plugins.get(name)
    if (!transport) return
    transport.close()
    this._plugins.delete(name)
    if (name === 'camera') this._camera = undefined
  }

  /** Close the robot connection and release all resources. */
  close(): void {
    for (const transport of this._plugins.values()) transport.close()
    this._plugins.clear()
    this._transport.close()
  }

  /** Support for `using` statement (TC39 explicit resource management). */
  [Symbol.dispose](): void {
    this.close()
  }
}
