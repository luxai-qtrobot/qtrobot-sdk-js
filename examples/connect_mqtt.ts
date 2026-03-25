/**
 * Connect to QTrobot over MQTT and print robot info.
 *
 * Usage:
 *   npm run example:connect
 */

import { Robot } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://192.168.3.152:1883'
const ROBOT_ID   = 'QTRD000320'

async function main() {
  Logger.info(`Connecting to ${ROBOT_ID} via ${BROKER_URL} ...`)

  const robot = await Robot.connect(BROKER_URL, ROBOT_ID)

  Logger.info(`Connected!`)
  Logger.info(`  robot_id:    ${robot.robotId}`)
  Logger.info(`  robot_type:  ${robot.robotType}`)
  Logger.info(`  sdk_version: ${robot.sdkVersion}`)

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
