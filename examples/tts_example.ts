/**
 * TTS examples — sync, async with cancel, SSML.
 *
 * Usage:
 *   npm run example:tts
 */

import { Robot } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://192.168.3.152:1883'
const ROBOT_ID   = 'QTRD000320'

async function main() {
  const robot = await Robot.connect(BROKER_URL, ROBOT_ID)

  // ---- 1. Synchronous — wait until speech finishes ----
  Logger.info('Saying hello...')
  await robot.tts.sayText({ text: 'Hello! I am QTrobot.' })
  Logger.info('Done.')

  // ---- 2. With options ----
  await robot.tts.sayText({ text: 'How are you today?', lang: 'en-US', rate: 0.9 })

  // ---- 3. Async with cancel ----
  Logger.info('Starting a long speech (will cancel after 1s)...')
  const controller = new AbortController()
  const speech = robot.tts.sayText({
    text: 'This is a very long sentence that will be cancelled before it finishes. i am talking ver very long scentence and it may take some time.',
    signal: controller.signal,
  })

  setTimeout(() => {
    Logger.info('Cancelling...')
    controller.abort()
  }, 1000)

  try {
    await speech
    Logger.info('Finished (not cancelled)')
  } catch (e) {
    Logger.warning(`Cancelled or error: ${e}`)
  }

  // ---- 4. List engines ----
  const engines = await robot.tts.listEngines()
  Logger.info(`Available engines: ${JSON.stringify(engines)}`)

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
