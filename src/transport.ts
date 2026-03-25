import {
  MqttConnection,
  MqttRpcRequester,
  MqttSubscriber,
  MqttPublisher,
} from '@luxai-qtrobot/magpie'

import type { MqttOptions } from '@luxai-qtrobot/magpie'

export type RouteMeta = {
  mqtt: { topic: string; qos?: number }
  direction?: 'in' | 'out'
}

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

export class MqttTransport {
  private _requesters = new Map<string, MqttRpcRequester>()

  constructor(
    private readonly _conn: MqttConnection,
    readonly robotId: string,
  ) {}

  /**
   * Issue the system describe RPC handshake and return the parsed description.
   * The describe endpoint uses the robot_id topic directly (no service path prefix).
   */
  async handshake(sdkVersion: string, timeoutSec: number): Promise<SystemDescription> {
    const requester = this._getOrCreateRequester(this.robotId)
    const raw = await requester.call({ sdk_version: sdkVersion }, timeoutSec) as {
      status: boolean
      response: SystemDescription
    }
    if (!raw?.status) throw new Error('Robot: system describe returned status=false')
    return raw.response
  }

  getRequester(mqttTopic: string): MqttRpcRequester {
    return this._getOrCreateRequester(mqttTopic)
  }

  getSubscriber(mqttTopic: string, qos?: number, queueSize?: number): MqttSubscriber {
    return new MqttSubscriber(this._conn, { topic: mqttTopic, qos: qos as 0 | 1 | 2 | undefined, queueSize })
  }

  getPublisher(): MqttPublisher {
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
