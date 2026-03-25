/**
 * Motor examples — list motors, read joint state, send joint commands.
 *
 * Usage:
 *   npm run example:motor
 */

import { Robot, JointCommandFrame, JointStateFrame } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://192.168.3.152:1883'
const ROBOT_ID   = 'QTRD000320'

async function main() {
  const robot = await Robot.connect(BROKER_URL, ROBOT_ID)

  // ---- 1. List motors ----
  const motors = await robot.motor.list()
  Logger.info(`Available motors: ${JSON.stringify(Object.keys(motors))}`)

  // ---- 2. Callback style stream ----
  Logger.info('Reading joint state (callback, 3 seconds)...')
  const unsubscribe = robot.motor.onJointsState((frame: JointStateFrame) => {
    for (const joint of frame.joints()) {
      Logger.info(`  [${joint}] pos=${frame.position(joint).toFixed(2)} vel=${frame.velocity(joint).toFixed(1)}`)
    }
  })

  await new Promise(r => setTimeout(r, 3000))
  unsubscribe()

  // ---- 3. Async iterator style ----
  Logger.info('Reading 3 frames via async iterator...')
  const reader = robot.motor.jointsStateReader()
  let count = 0
  for await (const frame of reader) {
    Logger.info(`  frame ${++count}: HeadYaw pos=${frame.position('HeadYaw').toFixed(2)}`)
    if (count >= 3) break
  }
  reader.close()

  // ---- 4. Direct read ----
  Logger.info('Direct read (one frame with 5s timeout)...')
  const directReader = robot.motor.jointsStateReader()
  try {
    const frame = await directReader.read(5.0)
    Logger.info(`Got frame. Joints: ${JSON.stringify(frame.joints())}`)
  } finally {
    directReader.close()
  }

  // ---- 5. Send joint command ----
  Logger.info('Sending HeadYaw command...')
  const writer = robot.motor.openJointsCommandWriter()
  const cmd = new JointCommandFrame()
  cmd.setJoint('HeadYaw', { position: 15, velocity: 40 })
  await writer.write(cmd)
  Logger.info('Command sent.')
  writer.close()

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
