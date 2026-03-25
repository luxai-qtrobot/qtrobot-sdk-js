/**
 * Motor examples — list motors, read joint state, send joint commands.
 *
 * Usage:
 *   npm run example:motor
 */

import { Robot, JointCommandFrame, JointStateFrame } from '../src'

const BROKER_URL = 'mqtt://localhost:1883'
const ROBOT_ID   = 'QTRD000320'

async function main() {
  const robot = await Robot.connect(BROKER_URL, ROBOT_ID)

  // ---- 1. List motors ----
  const motors = await robot.motor.list()
  console.log('Available motors:', Object.keys(motors))

  // ---- 2. Callback style stream ----
  console.log('\nReading joint state (callback, 3 seconds)...')
  const unsubscribe = robot.motor.onJointsState((frame: JointStateFrame) => {
    for (const joint of frame.joints()) {
      console.log(`  [${joint}] pos=${frame.position(joint).toFixed(2)} vel=${frame.velocity(joint).toFixed(1)}`)
    }
  })

  await new Promise(r => setTimeout(r, 3000))
  unsubscribe()

  // ---- 3. Async iterator style ----
  console.log('\nReading 3 frames via async iterator...')
  const reader = robot.motor.jointsStateReader()
  let count = 0
  for await (const frame of reader) {
    console.log(`  frame ${++count}: HeadYaw pos=${frame.position('HeadYaw').toFixed(2)}`)
    if (count >= 3) break
  }
  reader.close()

  // ---- 4. Direct read ----
  console.log('\nDirect read (one frame with 5s timeout)...')
  const directReader = robot.motor.jointsStateReader()
  try {
    const frame = await directReader.read(5.0)
    console.log('Got frame. Joints:', frame.joints())
  } finally {
    directReader.close()
  }

  // ---- 5. Send joint command ----
  console.log('\nSending HeadYaw command...')
  const writer = robot.motor.openJointsCommandWriter()
  const cmd = new JointCommandFrame()
  cmd.setJoint('HeadYaw', { position: 15, velocity: 40 })
  await writer.write(cmd)
  console.log('Command sent.')
  writer.close()

  robot.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
