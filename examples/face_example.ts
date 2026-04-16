/**
 * Face examples — list emotions, show emotion, look.
 *
 * Usage:
 *   npm run example:face
 */

import { Robot } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://10.231.0.2:1883'
const ROBOT_ID   = 'QTRD000320'

async function listEmotions(robot: Robot) {
  const emotions = await robot.face.listEmotions()
  Logger.info(`Available emotions (${emotions.length}):`)
  for (const e of emotions) {
    Logger.info(`  ${e}`)
  }
}

async function showEmotion(robot: Robot) {
  // Play an emotion and wait for it to finish
  Logger.info("Showing 'QT/kiss' emotion...")
  const ret1 = await robot.face.showEmotion({ emotion: 'QT/kiss' })
  Logger.info(`Done. response: ${JSON.stringify(ret1)}`)

  // Play an emotion at 2× speed
  Logger.info("Showing 'QT/surprise' at 2× speed...")
  const ret2 = await robot.face.showEmotion({ emotion: 'QT/surprise', speed: 2.0 })
  Logger.info(`Done. response: ${JSON.stringify(ret2)}`)
}

async function showEmotionCancel(robot: Robot) {
  // Play a long emotion and cancel it after 3 seconds
  Logger.info("Showing 'QT/breathing_exercise', will cancel after 3s...")
  const controller = new AbortController()
  const emotion = robot.face.showEmotion({
    emotion: 'QT/breathing_exercise',
    signal: controller.signal,
  })

  setTimeout(() => {
    Logger.info('Cancelling emotion...')
    controller.abort()
  }, 3000)

  try {
    await emotion
    Logger.info('Emotion finished (not cancelled).')
  } catch {
    Logger.info('Emotion cancelled.')
  }
}

async function lookEyes(robot: Robot) {
  // Move both eyes to the right
  Logger.info('Looking right...')
  const ret1 = await robot.face.look({ l_eye: [30, 0], r_eye: [30, 0] })
  Logger.info(`Done. response: ${JSON.stringify(ret1)}`)
  await new Promise(r => setTimeout(r, 1000))

  // Move eyes up-left
  Logger.info('Looking up-left...')
  const ret2 = await robot.face.look({ l_eye: [-20, -20], r_eye: [-20, -20] })
  Logger.info(`Done. response: ${JSON.stringify(ret2)}`)
  await new Promise(r => setTimeout(r, 1000))

  // Move eyes down, auto-reset to centre after 3 seconds
  Logger.info('Looking down, auto-reset in 3s...')
  const ret3 = await robot.face.look({ l_eye: [0, 20], r_eye: [0, 20], duration: 3.0 })
  Logger.info(`Eyes back to centre. response: ${JSON.stringify(ret3)}`)
}

void [showEmotion, showEmotionCancel, lookEyes]

async function main() {
  const robot = await Robot.connectMqtt(BROKER_URL, ROBOT_ID)
  Logger.info(`Connected to ${robot.robotId} (${robot.robotType})`)

  await listEmotions(robot)
  // await showEmotion(robot)
  // await showEmotionCancel(robot)
  // await lookEyes(robot)

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
