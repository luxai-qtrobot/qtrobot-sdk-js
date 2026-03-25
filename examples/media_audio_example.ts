/**
 * Media audio examples — volume control, play FG/BG audio files.
 * (RPC only — for audio streaming see microphone_example.ts)
 *
 * Usage:
 *   npm run example:media:audio
 */

import { Robot } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://192.168.3.152:1883'
const ROBOT_ID   = 'QTRD000320'

// Audio files that must exist on the robot
const FG_AUDIO = '/home/qtrobot/robot/data/audios/QT/5LittleBunnies.wav'
const BG_AUDIO = '/home/qtrobot/robot/data/audios/QT/John_Wesley_Tequila.mp3'

async function fgAudioVolume(robot: Robot) {
  Logger.info('Setting FG audio volume to 1.0...')
  await robot.media.setFgAudioVolume({ value: 1.0 })
  const vol = await robot.media.getFgAudioVolume()
  Logger.info(`FG audio volume after set: ${vol.toFixed(2)}`)
}

async function bgAudioVolume(robot: Robot) {
  Logger.info('Setting BG audio volume to 1.0...')
  await robot.media.setBgAudioVolume({ value: 1.0 })
  const vol = await robot.media.getBgAudioVolume()
  Logger.info(`BG audio volume after set: ${vol.toFixed(2)}`)
}

async function playFgAudioFile(robot: Robot) {
  // Blocking — wait for playback to finish
  Logger.info('Playing FG audio file (blocking)...')
  const ret = await robot.media.playFgAudioFile({ uri: FG_AUDIO })
  Logger.info(`Done. Result: ${ret}`)

  // Non-blocking — cancel after 5 seconds
  Logger.info('Playing FG audio file (will cancel after 5s)...')
  const controller = new AbortController()
  const play = robot.media.playFgAudioFile({ uri: FG_AUDIO, signal: controller.signal })
  setTimeout(() => controller.abort(), 5000)
  try {
    await play
    Logger.info('Playback finished.')
  } catch {
    Logger.info('FG audio file playback cancelled.')
  }
}

async function pauseResumeFgAudioFile(robot: Robot) {
  Logger.info('Playing FG audio file...')
  const controller = new AbortController()
  const play = robot.media.playFgAudioFile({ uri: FG_AUDIO, signal: controller.signal })

  await new Promise(r => setTimeout(r, 5000))
  Logger.info('Pausing FG audio...')
  await robot.media.pauseFgAudioFile()
  Logger.info('Paused. Waiting 3 seconds...')

  await new Promise(r => setTimeout(r, 3000))
  Logger.info('Resuming FG audio...')
  await robot.media.resumeFgAudioFile()
  Logger.info('Resumed.')

  await play
  Logger.info('FG audio file playback finished.')
}

async function playFgBgAudioFiles(robot: Robot) {
  await robot.media.setBgAudioVolume({ value: 0.7 })
  await robot.media.setFgAudioVolume({ value: 1.0 })

  Logger.info('Playing BG audio file...')
  const bgController = new AbortController()
  const bgPlay = robot.media.playBgAudioFile({ uri: BG_AUDIO, signal: bgController.signal })

  await new Promise(r => setTimeout(r, 5000))

  Logger.info('Starting FG audio file over BG...')
  const fgController = new AbortController()
  const fgPlay = robot.media.playFgAudioFile({ uri: FG_AUDIO, signal: fgController.signal })

  await Promise.all([bgPlay, fgPlay])
  Logger.info('Both lanes finished.')
  await robot.media.setBgAudioVolume({ value: 1.0 })
}

async function playOnlineAudioFile(robot: Robot) {
  const url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  Logger.info(`Playing online audio for 10s from: ${url}`)
  const controller = new AbortController()
  const play = robot.media.playFgAudioFile({ uri: url, signal: controller.signal })
  setTimeout(() => controller.abort(), 10000)
  try {
    await play
  } catch {
    Logger.info('Online audio playback cancelled.')
  }
}

void [bgAudioVolume, playFgAudioFile, pauseResumeFgAudioFile, playFgBgAudioFiles, playOnlineAudioFile]

async function main() {
  const robot = await Robot.connectMqtt(BROKER_URL, ROBOT_ID)
  Logger.info(`Connected to ${robot.robotId} (${robot.robotType})`)

  // await fgAudioVolume(robot)
  // await bgAudioVolume(robot)
  // await playFgAudioFile(robot)
  // await pauseResumeFgAudioFile(robot)
  // await playFgBgAudioFiles(robot)
  await playOnlineAudioFile(robot)

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
