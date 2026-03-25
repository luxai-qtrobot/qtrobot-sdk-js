/**
 * TTS examples — sync, async with cancel, SSML.
 *
 * Usage:
 *   npm run example:tts
 */

import { Robot } from '../src'

const BROKER_URL = 'mqtt://localhost:1883'
const ROBOT_ID   = 'QTRD000320'

async function main() {
  const robot = await Robot.connect(BROKER_URL, ROBOT_ID)

  // ---- 1. Synchronous — wait until speech finishes ----
  console.log('Saying hello...')
  await robot.tts.sayText('Hello! I am QTrobot.')
  console.log('Done.')

  // ---- 2. With options ----
  await robot.tts.sayText('How are you today?', { lang: 'en-US', rate: 0.9 })

  // ---- 3. Async with cancel ----
  console.log('Starting a long speech (will cancel after 2s)...')
  const action = robot.tts.sayTextAsync('This is a very long sentence that will be cancelled before it finishes.')

  setTimeout(async () => {
    console.log('Cancelling...')
    await action.cancel()
  }, 2000)

  try {
    await action.result
    console.log('Finished (not cancelled)')
  } catch (e) {
    console.log(`Cancelled or error: ${e}`)
  }

  // ---- 4. ActionHandle used directly with await ----
  await robot.tts.sayTextAsync('ActionHandle also works with await directly.')

  // ---- 5. List engines ----
  const engines = await robot.tts.listEngines()
  console.log('Available engines:', engines)

  robot.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
