/**
 * Gesture examples — list, play, record, store.
 *
 * Usage:
 *   npm run example:gesture
 */

import { createInterface } from 'readline'
import { Robot } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://192.168.3.152:1883'
const ROBOT_ID   = 'QTRD000320'

function waitForEnter(prompt: string): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(prompt, () => { rl.close(); resolve() }))
}

async function listGestures(robot: Robot) {
  const gestures = await robot.gesture.listFiles()
  Logger.info(`Available gestures (${gestures.length}):`)
  for (const g of gestures) {
    Logger.info(`  ${g}`)
  }
}

async function playGesture(robot: Robot) {
  Logger.info("Playing gesture 'QT/bye' (press <Enter> to cancel)...")
  const controller = new AbortController()
  const play = robot.gesture.playFile({ gesture: 'QT/bye', signal: controller.signal })

  waitForEnter('').then(() => {
    Logger.info('Cancelling gesture...')
    controller.abort()
  })

  try {
    await play
    Logger.info('Gesture finished.')
  } catch {
    Logger.info('Gesture cancelled. Homing all motors...')
    await robot.motor.homeAll()
  }
}

async function recordGesture(robot: Robot) {
  Logger.info('Recording right arm gesture. Will start in 2 seconds, max 20 seconds.')
  Logger.info('Move the arm freely, then press <Enter> to stop...')

  const controller = new AbortController()
  const recording = robot.gesture.record({
    motors: ['RightShoulderPitch', 'RightShoulderRoll', 'RightElbowRoll'],
    release_motors: true,
    delay_start_ms: 2000,
    timeout_ms: 20000,
    signal: controller.signal,
  })

  await waitForEnter('')
  await robot.gesture.stopRecord()

  const keyframes = await recording
  Logger.info(`Recording stopped. ${(keyframes.points as unknown[])?.length ?? 0} keyframes recorded.`)

  Logger.info('Playing back the recorded gesture in 2 seconds...')
  await new Promise(r => setTimeout(r, 2000))
  await robot.gesture.play({ keyframes })
  Logger.info('Playback done.')

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await new Promise<string>(resolve => rl.question('Save gesture? (y/n): ', resolve))
  rl.close()
  if (answer.toLowerCase() === 'y') {
    const rl2 = createInterface({ input: process.stdin, output: process.stdout })
    const name = await new Promise<string>(resolve => rl2.question('Gesture name: ', resolve))
    rl2.close()
    await robot.gesture.storeRecord({ gesture: name })
    Logger.info(`Gesture '${name}' stored.`)
  }
}

void [playGesture, recordGesture]

async function main() {
  const robot = await Robot.connectMqtt(BROKER_URL, ROBOT_ID)
  Logger.info(`Connected to ${robot.robotId} (${robot.robotType})`)

  await listGestures(robot)
  // await playGesture(robot)
  // await recordGesture(robot)

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
