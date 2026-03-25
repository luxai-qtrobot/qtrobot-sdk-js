/**
 * TTS examples — list engines, say text, cancel, SSML, config.
 *
 * Usage:
 *   npm run example:tts
 */

import { Robot } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://192.168.3.152:1883'
const ROBOT_ID   = 'QTRD000320'

async function listEngines(robot: Robot) {
  const engines = await robot.tts.listEngines()
  Logger.info(`Available TTS engines: ${JSON.stringify(engines)}`)
}

async function getSetDefaultEngine(robot: Robot) {
  const engine = await robot.tts.getDefaultEngine()
  Logger.info(`Current default TTS engine: ${engine}`)

  Logger.info("Setting default TTS engine to 'acapela'...")
  await robot.tts.setDefaultEngine({ engine: 'acapela' })
}

async function sayText(robot: Robot) {
  // Say a simple phrase using the default engine
  Logger.info('Saying text with default engine...')
  await robot.tts.sayText({ text: 'Hello, this is spoken with the default settings.' })

  // With rate and pitch adjustments
  Logger.info('Saying text with rate and pitch adjustments...')
  await robot.tts.sayText({ text: 'This is spoken slower at a higher pitch.', engine: 'acapela', rate: 0.85, pitch: 1.2 })

  // With explicit voice
  Logger.info('Saying text with voice override...')
  await robot.tts.sayText({ text: 'This is spoken with the Rosie voice.', engine: 'acapela', voice: 'Rosie' })

  // With inline Acapela speed tags
  await robot.tts.sayText({
    text: 'I will speak with different speed. \\rspd=130\\ Now I am speaking faster. \\rspd=70\\ And now I am speaking slower.',
    engine: 'acapela',
  })
}

async function sayTextCancel(robot: Robot) {
  Logger.info('Starting speech (will cancel after 2 seconds)...')
  const controller = new AbortController()
  const speech = robot.tts.sayText({
    text: 'This is a very long sentence that will be interrupted before it finishes after two seconds.',
    engine: 'acapela',
    signal: controller.signal,
  })

  setTimeout(() => controller.abort(), 2000)

  try {
    await speech
    Logger.info('Speech finished (not cancelled).')
  } catch {
    Logger.info('Speech cancelled.')
  }
}

async function saySsmlAzure(robot: Robot) {
  const ssml = [
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"',
    '       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">',
    '  <voice name="en-US-MultiTalker-Ava-Andrew:DragonHDLatestNeural">',
    '    <mstts:dialog>',
    '      <mstts:turn speaker="ava">Hello Andrew! How is your day going?</mstts:turn>',
    '      <mstts:turn speaker="andrew">Hey Ava! It has been great, just exploring QTrobot.</mstts:turn>',
    '    </mstts:dialog>',
    '  </voice>',
    '</speak>',
  ].join('\n')

  Logger.info('Saying SSML with azure engine...')
  await robot.tts.saySsml({ ssml, engine: 'azure' })
  Logger.info('Done.')
}

async function checkSsmlSupport(robot: Robot) {
  const engines = await robot.tts.listEngines() as string[]
  for (const engine of engines) {
    const supported = await robot.tts.supportsSsml({ engine })
    Logger.info(`  ${engine}: SSML supported = ${supported}`)
  }
}

async function getLanguagesAndVoices(robot: Robot) {
  const langs = await robot.tts.getLanguages({ engine: 'acapela' }) as string[]
  Logger.info(`acapela languages: ${JSON.stringify(langs)}`)

  const voices = await robot.tts.getVoices({ engine: 'acapela' }) as string[]
  Logger.info(`acapela voices (${voices.length}):`)
  for (const v of voices) {
    Logger.info(`  ${v}`)
  }
}

async function engineConfig(robot: Robot) {
  const cfg = await robot.tts.getConfig({ engine: 'acapela' })
  Logger.info(`acapela config: ${JSON.stringify(cfg)}`)

  Logger.info('Configuring acapela engine with pitch and rate adjustments...')
  await robot.tts.setConfig({ config: { pitch: 1.0, rate: 0.8 }, engine: 'acapela' })
  Logger.info('Config updated.')
}

void [getSetDefaultEngine, sayText, sayTextCancel, saySsmlAzure, checkSsmlSupport, engineConfig]

async function main() {
  const robot = await Robot.connectMqtt(BROKER_URL, ROBOT_ID)
  Logger.info(`Connected to ${robot.robotId} (${robot.robotType})`)

  await listEngines(robot)
  await getLanguagesAndVoices(robot)
  // await getSetDefaultEngine(robot)
  // await sayText(robot)
  // await sayTextCancel(robot)
  // await checkSsmlSupport(robot)
  // await saySsmlAzure(robot)
  // await engineConfig(robot)

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
