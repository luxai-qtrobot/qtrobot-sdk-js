/**
 * Speaker examples — get/set volume, mute/unmute.
 *
 * Usage:
 *   npm run example:speaker
 */

import { Robot } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://10.231.0.2:1883'
const ROBOT_ID   = 'QTRD000320'

async function getVolume(robot: Robot) {
  const vol = await robot.speaker.getVolume()
  Logger.info(`Current speaker volume: ${vol.toFixed(2)}`)
}

async function setVolume(robot: Robot) {
  Logger.info('Setting volume to 0.8...')
  await robot.speaker.setVolume({ value: 0.8 })
  Logger.info(`Volume after set: ${(await robot.speaker.getVolume()).toFixed(2)}`)

  Logger.info('Setting volume to 0.7...')
  await robot.speaker.setVolume({ value: 0.7 })
  Logger.info(`Volume after set: ${(await robot.speaker.getVolume()).toFixed(2)}`)
}

async function muteUnmute(robot: Robot) {
  Logger.info('Muting speaker...')
  await robot.speaker.mute()
  Logger.info('Speaker muted. Waiting 2 seconds...')
  await new Promise(r => setTimeout(r, 2000))

  Logger.info('Unmuting speaker...')
  await robot.speaker.unmute()
  Logger.info('Speaker unmuted.')
}

void [setVolume, muteUnmute]

async function main() {
  const robot = await Robot.connectMqtt(BROKER_URL, ROBOT_ID)
  Logger.info(`Connected to ${robot.robotId} (${robot.robotType})`)

  await getVolume(robot)
  // await setVolume(robot)
  // await muteUnmute(robot)

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
