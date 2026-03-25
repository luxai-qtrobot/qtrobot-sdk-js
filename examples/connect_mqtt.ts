/**
 * Connect to QTrobot over MQTT and print robot info.
 *
 * Usage:
 *   npm run example:connect
 */

import { Robot } from '../src'

const BROKER_URL = 'mqtt://localhost:1883'
const ROBOT_ID   = 'QTRD000320'

async function main() {
  console.log(`Connecting to ${ROBOT_ID} via ${BROKER_URL} ...`)

  const robot = await Robot.connect(BROKER_URL, ROBOT_ID)

  console.log(`Connected!`)
  console.log(`  robot_id:    ${robot.robotId}`)
  console.log(`  robot_type:  ${robot.robotType}`)
  console.log(`  sdk_version: ${robot.sdkVersion}`)

  robot.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
