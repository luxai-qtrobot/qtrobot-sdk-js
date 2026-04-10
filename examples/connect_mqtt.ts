/**
 * connect_mqtt.ts
 *
 * Shows the different ways to create a Robot client over MQTT transport.
 *
 * The robot must be running qtrobot-service-hub-gateway-mqtt, which bridges
 * the robot's services to an MQTT broker.
 *
 * Usage:
 *   npm run example:connect
 */

import { Robot, MqttTransport } from '../src'
import { Logger, MqttConnection } from '@luxai-qtrobot/magpie'

const BROKER_LOCAL  = 'mqtt://10.231.0.2:1883'        // robot's onboard broker
const BROKER_PUBLIC = 'mqtt://broker.hivemq.com:1883'    // public broker (no auth)
const ROBOT_ID      = 'QTRD000320'                       // change to your robot serial

const BROKER = BROKER_LOCAL  // switch to BROKER_PUBLIC to test over the internet


// ── Option 1 ──────────────────────────────────────────────────────────────────
// Basic plain-TCP connection — no TLS, no authentication.
async function connectBasic() {
  const robot = await Robot.connectMqtt(BROKER, ROBOT_ID)
  Logger.info(`[basic] connected to ${robot.robotId} (${robot.robotType})`)
  robot.close()
}


// ── Option 2 ──────────────────────────────────────────────────────────────────
// With custom connect and RPC timeouts.
async function connectWithTimeouts() {
  const robot = await Robot.connectMqtt(BROKER, ROBOT_ID, {
    connectTimeoutSec: 15,
    defaultRpcTimeoutSec: 30,
  })
  Logger.info(`[timeouts] connected to ${robot.robotId} (${robot.robotType})`)
  robot.close()
}


// ── Option 3 ──────────────────────────────────────────────────────────────────
// WebSocket transport — useful when connecting through a web proxy or firewall
// that only allows HTTP/HTTPS traffic.
async function connectWebSocket() {
  const robot = await Robot.connectMqtt('ws://10.231.0.2:9001', ROBOT_ID)
  Logger.info(`[ws] connected to ${robot.robotId} (${robot.robotType})`)
  robot.close()
}


// ── Option 4 ──────────────────────────────────────────────────────────────────
// Power-user style: construct MqttConnection and MqttTransport manually,
// then pass the transport directly to Robot.connect().
// Useful when you need direct control over the connection lifecycle,
// or when implementing a custom transport for a different protocol.
async function connectManualTransport() {
  const conn = new MqttConnection(BROKER_LOCAL, {
    clientId: `qtrobot-sdk-${ROBOT_ID}`,
  })
  await conn.connect(10_000)

  const transport = new MqttTransport(conn, ROBOT_ID)
  const robot = await Robot.connect(transport)
  Logger.info(`[manual] connected to ${robot.robotId} (${robot.robotType})`)
  robot.close()
}


// ── Option 5 ──────────────────────────────────────────────────────────────────
// Using statement — automatic cleanup via TC39 explicit resource management.
async function connectUsingStatement() {
  await using robot = await Robot.connectMqtt(BROKER, ROBOT_ID)
  Logger.info(`[using] connected to ${robot.robotId} (${robot.robotType})`)
  // robot.close() is called automatically when the block exits
}


// All options available — uncomment one in main() to run it:
void [BROKER_PUBLIC, connectWithTimeouts, connectWebSocket, connectManualTransport, connectUsingStatement]

async function main() {
  // Logger.setLevel('debug')

  await connectBasic()
  // await connectWithTimeouts()
  // await connectWebSocket()
  // await connectManualTransport()
  // await connectUsingStatement()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
