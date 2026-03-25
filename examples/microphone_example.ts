/**
 * Microphone example — capture 3 seconds of audio from the internal mic.
 *
 * Usage:
 *   npm run example:microphone
 */

import { Robot, AudioFrameRaw } from '../src'
import { writeFileSync } from 'fs'

const BROKER_URL  = 'mqtt://localhost:1883'
const ROBOT_ID    = 'QTRD000320'
const OUTPUT_FILE = 'output.pcm'
const DURATION_MS = 3000

async function main() {
  const robot = await Robot.connect(BROKER_URL, ROBOT_ID)

  console.log(`Capturing audio for ${DURATION_MS / 1000}s...`)

  const chunks: Uint8Array[] = []
  let sampleRate = 0
  let bitDepth = 0
  let channels = 0

  const unsubscribe = robot.microphone.onIntAudioCh0((frame: AudioFrameRaw) => {
    if (sampleRate === 0) {
      sampleRate = frame.sample_rate
      bitDepth   = frame.bit_depth
      channels   = frame.channels
      console.log(`Audio format: ${sampleRate}Hz / ${bitDepth}bit / ${channels}ch`)
    }
    if (frame.data instanceof Uint8Array) {
      chunks.push(frame.data)
    }
  })

  await new Promise(r => setTimeout(r, DURATION_MS))
  unsubscribe()

  // Write raw PCM
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const buffer = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length }

  writeFileSync(OUTPUT_FILE, buffer)
  console.log(`Wrote ${total} bytes to ${OUTPUT_FILE}`)
  console.log(`Play with: ffplay -f s${bitDepth}le -ar ${sampleRate} -ac ${channels} ${OUTPUT_FILE}`)

  robot.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
