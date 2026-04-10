/**
 * Media video examples — FG alpha, play BG/FG video files.
 * (RPC only — for video streaming see camera_example.ts)
 *
 * Usage:
 *   npm run example:media:video
 */

import { Robot } from '../src'
import { Logger } from '@luxai-qtrobot/magpie'

const BROKER_URL = 'mqtt://10.231.0.2:1883'
const ROBOT_ID   = 'QTRD000320'

// Video files that must exist on the robot
const BG_VIDEO = '/home/qtrobot/robot/data/emotions/QT/kiss.avi'
const FG_VIDEO = '/home/qtrobot/robot/data/emotions/QT/happy.avi'

async function fgVideoAlpha(robot: Robot) {
  Logger.info('Setting FG video alpha to 1.0 (fully opaque)...')
  await robot.media.setFgVideoAlpha({ value: 1.0 })

  Logger.info('Setting FG video alpha to 0.5 (half transparent)...')
  await robot.media.setFgVideoAlpha({ value: 0.5 })
  await new Promise(r => setTimeout(r, 2000))

  Logger.info('Restoring FG video alpha to 1.0...')
  await robot.media.setFgVideoAlpha({ value: 1.0 })
}

async function playBgVideoFile(robot: Robot) {
  // Blocking — wait for playback to finish
  Logger.info('Playing BG video file (blocking)...')
  const ret = await robot.media.playBgVideoFile({ uri: BG_VIDEO })
  Logger.info(`Done. Result: ${ret}`)

  // Non-blocking — cancel after 2 seconds
  Logger.info('Playing BG video file (will cancel after 2s)...')
  const controller = new AbortController()
  const play = robot.media.playBgVideoFile({ uri: BG_VIDEO, signal: controller.signal })
  setTimeout(() => controller.abort(), 2000)
  try {
    await play
    Logger.info('Playback finished.')
  } catch {
    Logger.info('BG video file playback cancelled.')
  }
}

async function pauseResumeBgVideoFile(robot: Robot) {
  Logger.info('Playing BG video file...')
  const controller = new AbortController()
  const play = robot.media.playBgVideoFile({ uri: BG_VIDEO, signal: controller.signal })

  await new Promise(r => setTimeout(r, 2000))
  Logger.info('Pausing BG video...')
  await robot.media.pauseBgVideoFile()
  Logger.info('Paused. Waiting 3 seconds...')

  await new Promise(r => setTimeout(r, 3000))
  Logger.info('Resuming BG video...')
  await robot.media.resumeBgVideoFile()
  Logger.info('Resumed.')

  await play
  Logger.info('BG video file playback finished.')
}

async function playFgVideoWithAudio(robot: Robot) {
  // Play a FG video file with its embedded audio track
  Logger.info('Playing FG video file with audio...')
  const ret = await robot.media.playFgVideoFile({ uri: FG_VIDEO, with_audio: true })
  Logger.info(`Done. Result: ${ret}`)
}

void [fgVideoAlpha, pauseResumeBgVideoFile, playFgVideoWithAudio]

async function main() {
  const robot = await Robot.connectMqtt(BROKER_URL, ROBOT_ID)
  Logger.info(`Connected to ${robot.robotId} (${robot.robotType})`)

  await playBgVideoFile(robot)
  // await fgVideoAlpha(robot)
  // await pauseResumeBgVideoFile(robot)
  // await playFgVideoWithAudio(robot)

  robot.close()
}

main().catch(err => {
  Logger.error(String(err))
  process.exit(1)
})
