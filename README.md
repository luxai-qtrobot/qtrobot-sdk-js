# @luxai-qtrobot/robot-sdk

[![npm version](https://img.shields.io/npm/v/@luxai-qtrobot/robot-sdk)](https://www.npmjs.com/package/@luxai-qtrobot/robot-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](LICENSE)

A TypeScript/JavaScript SDK for communicating with [LuxAI](https://luxai.com) robots. It provides a clean, transport-agnostic API for controlling robot hardware — speech synthesis, face animations, gestures, motors, audio/video playback, camera, and microphone — from any Node.js or browser environment over MQTT or WebRTC.

> **Primary target:** QTrobot v3 (`QTRD` series). The SDK is designed to be robot-agnostic; future robot models can be supported by extending the API definitions.

---

## Table of Contents

- [Installation](#installation)
  - [npm](#npm)
  - [CDN (no bundler required)](#cdn-no-bundler-required)
- [Connecting to the Robot](#connecting-to-the-robot)
  - [MQTT transport](#mqtt-transport)
  - [WebRTC transport](#webrtc-transport)
  - [Custom transport](#custom-transport)
- [API Concepts](#api-concepts)
  - [Awaiting RPC calls](#awaiting-rpc-calls)
  - [Cancellation with AbortController](#cancellation-with-abortcontroller)
  - [Stream APIs](#stream-apis)
- [API Reference](#api-reference)
  - [TTS — Text-to-Speech](#tts--text-to-speech)
  - [Face](#face)
  - [Gesture](#gesture)
  - [Motor](#motor)
  - [Media — Audio](#media--audio)
  - [Media — Video](#media--video)
  - [Speaker](#speaker)
  - [Microphone](#microphone)
- [Plugin System](#plugin-system)  
- [Examples](#examples)
- [License](#license)

---

## Installation

### npm

```bash
npm install @luxai-qtrobot/robot-sdk
```

Node.js **≥ 18** is required (uses native `AbortController`, `AbortSignal`, `Symbol.asyncIterator`, and `Symbol.dispose`).

### CDN (no bundler required)

Drop a single `<script>` tag into any HTML page — no build step needed:

```html
<script src="https://cdn.jsdelivr.net/npm/@luxai-qtrobot/robot-sdk/dist/qtrobot-sdk.umd.js"></script>
```

All exports are available under the global `QTRobotSDK` object:

```js
const { Robot } = QTRobotSDK
```

**Minimal browser example (MQTT over WebSocket):**

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@luxai-qtrobot/robot-sdk/dist/qtrobot-sdk.umd.js"></script>
</head>
<body>
<script>
  const { Robot } = QTRobotSDK

  // Browsers require WebSocket — use ws:// or wss://, not mqtt://
  const robot = await Robot.connectMqtt('ws://192.168.1.100:9001', 'QTRD000320')
  console.log(`Connected to ${robot.robotId}`)

  const ret = await robot.tts.sayText({ text: 'Hello from the browser!' })
  console.log('sayText response:', ret)

  robot.close()
</script>
</body>
</html>
```

> **Note:** Browsers cannot open raw TCP connections. Always use `ws://` (plain WebSocket) or `wss://` (WebSocket + TLS) in browser environments. Node.js supports all schemes including `mqtt://` and `mqtts://`.

---

## Connecting to the Robot

The `Robot` class is the entry point. All APIs are accessible as namespaced properties on it (`robot.tts`, `robot.face`, `robot.motor`, …).

Always call `robot.close()` when done, or use the `using` keyword (TC39 explicit resource management) for automatic cleanup.

---

### MQTT transport

Connect to the robot through an MQTT broker via the `qtrobot-service-hub-gateway-mqtt` bridge running on the robot. This is the transport of choice for remote connections (over the internet, cloud brokers) and browser environments (via WebSocket).

```typescript
import { Robot } from '@luxai-qtrobot/robot-sdk'

// Basic — plain TCP, no authentication
const robot = await Robot.connectMqtt('mqtt://192.168.1.100:1883', 'QTRD000320')

console.log(`Connected to ${robot.robotId} (${robot.robotType})`)
console.log(`SDK version: ${robot.sdkVersion}`)

robot.close()
```

**WebSocket (useful through firewalls and proxies):**

```typescript
const robot = await Robot.connectMqtt('ws://192.168.1.100:9001', 'QTRD000320')
```

**With connection options:**

```typescript
const robot = await Robot.connectMqtt('mqtt://192.168.1.100:1883', 'QTRD000320', {
  connectTimeoutSec: 15,      // broker + handshake timeout (default: 10)
  defaultRpcTimeoutSec: 30,   // default timeout for all RPC calls (default: none)
})
```

**Using statement — automatic cleanup:**

```typescript
await using robot = await Robot.connectMqtt('mqtt://192.168.1.100:1883', 'QTRD000320')
await robot.tts.sayText({ text: 'Hello!' })
// robot.close() is called automatically when the block exits
```

---

### WebRTC transport

Connects to the robot over a peer-to-peer WebRTC data channel, using MQTT only for signaling (SDP/ICE exchange). Once the data channel is open, all RPC traffic flows directly over WebRTC — no broker in the loop. This transport is ideal for browser environments with low-latency requirements or restricted MQTT access.

```typescript
import { Robot } from '@luxai-qtrobot/robot-sdk'

// broker URL is the MQTT WebSocket endpoint used only for signaling
const robot = await Robot.connectWebrtcMqtt('ws://192.168.1.100:9001', 'QTRD000320', {
  connectTimeoutSec: 30,
})

console.log(`Connected to ${robot.robotId} (${robot.robotType})`)
robot.close()
```

> **Note:** The API is identical to MQTT — just swap `connectMqtt` for `connectWebrtcMqtt`. WebRTC negotiation can take up to ~10 seconds, so use a higher `connectTimeoutSec` than the MQTT default.

---

### Custom transport

`connectMqtt()` is a convenience helper. For full lifecycle control, or to implement a custom transport for a different protocol, construct the transport manually and pass it to `Robot.connect()`:

```typescript
import { Robot, MqttTransport } from '@luxai-qtrobot/robot-sdk'
import { MqttConnection } from '@luxai-qtrobot/magpie'

const conn = new MqttConnection('mqtt://192.168.1.100:1883', {
  clientId: 'my-app-QTRD000320',
})
await conn.connect(10_000)

const transport = new MqttTransport(conn, 'QTRD000320')
const robot = await Robot.connect(transport)
```

You can also extend the abstract `Transport` class to implement your own transport:

```typescript
import { Transport, SystemDescription } from '@luxai-qtrobot/robot-sdk'
import { RpcRequester, StreamReader, StreamWriter } from '@luxai-qtrobot/magpie'

class MyCustomTransport extends Transport {
  get robotId() { return 'MY_ROBOT_001' }
  async handshake(sdkVersion: string, timeoutSec: number): Promise<SystemDescription> { ... }
  getRequester(topic: string): RpcRequester { ... }
  getSubscriber(topic: string, qos?: number, queueSize?: number): StreamReader { ... }
  getPublisher(): StreamWriter { ... }
  close(): void { ... }
}

const robot = await Robot.connect(new MyCustomTransport())
```

---

## API Concepts

### Awaiting RPC calls

All RPC methods are `async` and return a `Promise`. Use `await` to block until the robot responds.

Every call returns the raw `response` value from the robot server. Query methods return a typed value (`string[]`, `boolean`, `object`, …). Action methods (say text, show emotion, home motors, …) return `unknown` — the server always sends at least a `true`/`false` in the response, which you can optionally inspect:

```typescript
// Action — check the server response
const ret = await robot.tts.sayText({ text: 'Hello world!' })
console.log('response:', ret)   // e.g. true

// Query — typed return value
const engines = await robot.tts.listEngines()
console.log(engines)  // ['acapela', 'azure', ...]
```

If the server reports failure (`status=false`), the SDK throws a `RobotApiError` before returning — so you only need to inspect the return value for application-level logic, not for transport errors.

Methods with parameters always take a **single options object**, with required fields typed as non-optional and optional fields typed with `?`:

```typescript
// Required: text. Optional: engine, lang, voice, rate, pitch, volume, style
await robot.tts.sayText({ text: 'Hello!', lang: 'en-US', rate: 0.9 })

// Required: motor
await robot.motor.home({ motor: 'HeadYaw' })

// No parameters — no options object
await robot.motor.homeAll()
```

---

### Cancellation with AbortController

Long-running operations that support cancellation (speech, emotion animations, gestures, audio/video playback, gesture recording) accept an optional `signal` field in their options object. This follows the same pattern as the browser `fetch` API.

```typescript
const controller = new AbortController()

// Start the operation, passing the signal
const speech = robot.tts.sayText({
  text: 'This is a long sentence that may be interrupted.',
  signal: controller.signal,
})

// Cancel after 2 seconds
setTimeout(() => controller.abort(), 2000)

try {
  await speech
  console.log('Finished.')
} catch {
  console.log('Cancelled.')
}
```

**Cancelling from user input or an event:**

```typescript
const controller = new AbortController()

// Cancel when the user presses Ctrl+C
process.once('SIGINT', () => controller.abort())

await robot.face.showEmotion({
  emotion: 'QT/breathing_exercise',
  signal: controller.signal,
})
```

**Multiple operations at once:**

```typescript
const controller = new AbortController()

await Promise.all([
  robot.tts.sayText({ text: 'Playing audio at the same time.', signal: controller.signal }),
  robot.media.playFgAudioFile({ uri: '/path/to/music.wav',    signal: controller.signal }),
])

// Cancel both at once
controller.abort()
```

> **How it works:** When `signal.aborted` fires, the SDK sends the robot's cancel RPC first, waits for acknowledgement, and only then rejects the awaited promise. This guarantees the cancel command reaches the robot before your code continues.

---

### Stream APIs

Streams let you receive continuous data *from* the robot (outbound streams) or push frames *to* the robot (inbound streams).

#### Callback style (simplest)

```typescript
const unsubscribe = robot.motor.onJointsState((frame) => {
  for (const joint of frame.joints()) {
    console.log(`${joint}: ${frame.position(joint).toFixed(1)}°`)
  }
})

// Stop after 5 seconds
setTimeout(unsubscribe, 5000)
```

#### Async iterator (for sequential processing)

```typescript
const reader = robot.motor.jointsStateReader()

for await (const frame of reader) {
  console.log(`HeadYaw: ${frame.position('HeadYaw').toFixed(1)}°`)
  // break when done
}

reader.close()
```

#### Direct read (one frame at a time)

```typescript
const reader = robot.motor.jointsStateReader()

try {
  const frame = await reader.read(5.0)   // 5-second timeout
  console.log(frame.joints())
} finally {
  reader.close()
}
```

#### Writer (push frames to the robot)

```typescript
import { JointCommandFrame } from '@luxai-qtrobot/robot-sdk'

const writer = robot.motor.openJointsCommandWriter()

const cmd = new JointCommandFrame()
cmd.setJoint('HeadYaw', { position: 30, velocity: 40 })
await writer.write(cmd)

writer.close()
```

---

## API Reference

### TTS — Text-to-Speech

```typescript
robot.tts.<method>(options)
```

**Engine management:**

| Method | Returns | Description |
|---|---|---|
| `listEngines()` | `string[]` | All loaded TTS engine IDs |
| `getDefaultEngine()` | `string` | Current default engine ID |
| `setDefaultEngine({ engine })` | `unknown` | Set the default engine |
| `getLanguages({ engine? })` | `string[]` | Supported language codes |
| `getVoices({ engine? })` | `object[]` | Available voices |
| `supportsSsml({ engine? })` | `boolean` | Whether the engine accepts SSML |
| `getConfig({ engine? })` | `object` | Current engine configuration |
| `setConfig({ config, engine? })` | `unknown` | Update engine configuration |

**Speech:**

| Method | Returns | Description |
|---|---|---|
| `sayText({ text, engine?, lang?, voice?, rate?, pitch?, volume?, style?, signal? })` | `unknown` | Speak plain text (blocks until done) |
| `saySsml({ ssml, engine?, signal? })` | `unknown` | Speak SSML markup (blocks until done) |

> All `engine?` parameters are optional — the default engine is used when omitted.

**Examples:**

```typescript
// List engines and voices
const engines = await robot.tts.listEngines()            // ['acapela', 'azure']
const voices  = await robot.tts.getVoices({ engine: 'acapela' })

// Basic speech
await robot.tts.sayText({ text: 'Hello!' })
await robot.tts.sayText({ text: 'Slower and higher.', engine: 'acapela', rate: 0.8, pitch: 1.2 })
await robot.tts.sayText({ text: 'Using a specific voice.', engine: 'acapela', voice: 'Rosie' })

// Cancel speech after 2 seconds
const controller = new AbortController()
setTimeout(() => controller.abort(), 2000)
try {
  await robot.tts.sayText({
    text: 'This sentence is very long and will be interrupted.',
    signal: controller.signal,
  })
} catch { /* cancelled */ }

// SSML (Azure multi-speaker example)
const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="en-US-MultiTalker-Ava-Andrew:DragonHDLatestNeural">
    <mstts:dialog>
      <mstts:turn speaker="ava">Hello! How are you?</mstts:turn>
      <mstts:turn speaker="andrew">Great, thanks for asking!</mstts:turn>
    </mstts:dialog>
  </voice>
</speak>`
await robot.tts.saySsml({ ssml, engine: 'azure' })
```

---

### Face

```typescript
robot.face.<method>(options)
```

| Method | Returns | Description |
|---|---|---|
| `listEmotions()` | `string[]` | Available emotion animation file paths |
| `showEmotion({ emotion, speed?, signal? })` | `unknown` | Play an emotion animation (blocks until done) |
| `look({ l_eye, r_eye, duration? })` | `unknown` | Move eye pupils; auto-reset to centre if `duration > 0` |

> `l_eye` and `r_eye` are `[dx, dy]` pixel offsets from the centre of each eye.

**Examples:**

```typescript
const emotions = await robot.face.listEmotions()   // ['QT/kiss', 'QT/surprise', ...]

// Blocking — waits until animation finishes
await robot.face.showEmotion({ emotion: 'QT/surprise' })
await robot.face.showEmotion({ emotion: 'QT/surprise', speed: 2.0 })  // 2× speed

// Cancel after 3 seconds
const controller = new AbortController()
setTimeout(() => controller.abort(), 3000)
try {
  await robot.face.showEmotion({ emotion: 'QT/breathing_exercise', signal: controller.signal })
} catch { /* cancelled */ }

// Move eyes: [dx, dy] pixel offset from centre
await robot.face.look({ l_eye: [30, 0],    r_eye: [30, 0] })          // look right
await robot.face.look({ l_eye: [-20, -20], r_eye: [-20, -20] })       // look up-left
await robot.face.look({ l_eye: [0, 20],    r_eye: [0, 20], duration: 3.0 })  // auto-reset in 3 s
```

---

### Gesture

```typescript
robot.gesture.<method>(options)
```

**RPC methods:**

| Method | Returns | Description |
|---|---|---|
| `listFiles()` | `string[]` | Available gesture file names |
| `playFile({ gesture, speed_factor?, signal? })` | `boolean` | Play a named gesture file (blocks until done) |
| `play({ keyframes, resample?, rate_hz?, speed_factor?, signal? })` | `unknown` | Play in-memory keyframes (blocks until done) |
| `record({ motors, release_motors?, delay_start_ms?, timeout_ms?, refine_keyframe?, keyframe_pos_eps?, keyframe_max_gap_us?, signal? })` | `object` | Record a gesture trajectory (blocks until stopped or timed out) |
| `stopRecord()` | `boolean` | Stop an in-progress recording |
| `storeRecord({ gesture })` | `unknown` | Persist the last recording as a named file |

**Stream methods:**

| Method | Description |
|---|---|
| `onProgress(handler, onError?)` | Subscribe to gesture playback progress events |
| `progressReader(options?)` | Open an async-iterable progress reader |

**Examples:**

```typescript
const gestures = await robot.gesture.listFiles()   // ['QT/bye', 'QT/happy', ...]

// Play a named gesture file (blocking)
await robot.gesture.playFile({ gesture: 'QT/bye' })
await robot.gesture.playFile({ gesture: 'QT/bye', speed_factor: 1.5 })

// Cancel on user input
const controller = new AbortController()
process.once('SIGINT', () => controller.abort())
try {
  await robot.gesture.playFile({ gesture: 'QT/bye', signal: controller.signal })
} catch {
  await robot.motor.homeAll()  // return to rest pose
}

// Record a gesture, play it back, then save it
const controller2 = new AbortController()
const recording = robot.gesture.record({
  motors: ['RightShoulderPitch', 'RightShoulderRoll', 'RightElbowRoll'],
  release_motors: true,
  delay_start_ms: 2000,
  timeout_ms: 20000,
  signal: controller2.signal,
})

// ... user moves the arm ... then stop the recording:
await robot.gesture.stopRecord()
const keyframes = await recording    // { points: [...], ... }

await robot.gesture.play({ keyframes })          // play it back
await robot.gesture.storeRecord({ gesture: 'my_wave' })  // save for later
```

---

### Motor

```typescript
robot.motor.<method>(options)
```

**RPC methods:**

| Method | Returns | Description |
|---|---|---|
| `list()` | `object` | All motor names and their configuration |
| `on({ motor })` | `unknown` | Enable torque on a single motor |
| `off({ motor })` | `unknown` | Disable torque on a single motor |
| `onAll()` | `unknown` | Enable torque on all motors |
| `offAll()` | `unknown` | Disable torque on all motors |
| `home({ motor })` | `unknown` | Move a single motor to its home position |
| `homeAll()` | `unknown` | Move all motors to their home positions |
| `setVelocity({ motor, velocity })` | `unknown` | Set the default velocity limit for a motor |
| `setCalib({ motor, offset?, overload_threshold?, velocity_max?, store? })` | `unknown` | Apply calibration parameters (optionally persist) |
| `calibAll()` | `unknown` | Re-apply stored calibration to all motors |

**Stream methods:**

| Method | Description |
|---|---|
| `onJointsState(handler, onError?)` | Subscribe to joint position / velocity / effort / temperature / voltage |
| `jointsStateReader(options?)` | Open an async-iterable joint state reader |
| `onJointsError(handler, onError?)` | Subscribe to motor fault events |
| `jointsErrorReader(options?)` | Open an async-iterable joint error reader |
| `openJointsCommandWriter()` | Open a writer to send direct joint position / velocity commands |
| `openJointsTrajectoryWriter()` | Open a writer to send multi-joint trajectory commands |

**Examples:**

```typescript
import { JointStateFrame, JointCommandFrame } from '@luxai-qtrobot/robot-sdk'

const motors = await robot.motor.list()
// { HeadYaw: { position_min: -90, position_max: 90, ... }, ... }

await robot.motor.homeAll()
await robot.motor.off({ motor: 'RightShoulderPitch' })   // release for manual positioning
await robot.motor.setVelocity({ motor: 'HeadYaw', velocity: 50 })

// Real-time joint state via callback
const unsubscribe = robot.motor.onJointsState((frame: JointStateFrame) => {
  for (const joint of frame.joints()) {
    console.log(`${joint}: pos=${frame.position(joint).toFixed(1)}° temp=${frame.temperature(joint).toFixed(0)}°C`)
  }
})
setTimeout(unsubscribe, 5000)

// Async iterator — read 10 frames then stop
const reader = robot.motor.jointsStateReader({ queueSize: 2 })
let count = 0
for await (const frame of reader) {
  console.log(`HeadYaw: ${frame.position('HeadYaw').toFixed(1)}°`)
  if (++count >= 10) break
}
reader.close()

// Direct joint commands via stream
const writer = robot.motor.openJointsCommandWriter()
const cmd = new JointCommandFrame()
cmd.setJoint('HeadYaw', { position: 30, velocity: 40 })
await writer.write(cmd)
writer.close()
```

---

### Media — Audio

The media subsystem provides two independent audio lanes: **Foreground (FG)** for primary content and **Background (BG)** for ambient/music. Each lane supports file playback (local files and URLs) and raw PCM streaming.

```typescript
robot.media.<method>(options)
```

**Volume:**

| Method | Returns | Description |
|---|---|---|
| `getFgAudioVolume()` | `number` | FG lane volume `[0.0, 1.0]` |
| `setFgAudioVolume({ value })` | `unknown` | Set FG lane volume |
| `getBgAudioVolume()` | `number` | BG lane volume |
| `setBgAudioVolume({ value })` | `unknown` | Set BG lane volume |

**FG file playback:**

| Method | Returns | Description |
|---|---|---|
| `playFgAudioFile({ uri, signal? })` | `boolean` | Play a file or URL (blocks until done) |
| `pauseFgAudioFile()` | `unknown` | Pause the current FG file |
| `resumeFgAudioFile()` | `unknown` | Resume the paused FG file |

**BG file playback:** same pattern — `playBgAudioFile`, `pauseBgAudioFile`, `resumeBgAudioFile`.

**PCM streaming:**

| Method | Description |
|---|---|
| `openFgAudioStreamWriter()` | Open a writer to stream raw PCM frames to the FG lane |
| `openBgAudioStreamWriter()` | Open a writer to stream raw PCM frames to the BG lane |
| `cancelFgAudioStream()` | Stop the active FG PCM stream (`unknown` response) |
| `cancelBgAudioStream()` | Stop the active BG PCM stream (`unknown` response) |

**Examples:**

```typescript
await robot.media.setFgAudioVolume({ value: 1.0 })

// Blocking playback (local file or URL)
await robot.media.playFgAudioFile({ uri: '/home/qtrobot/audio/hello.wav' })
await robot.media.playFgAudioFile({ uri: 'https://example.com/song.mp3' })

// Cancel after 5 seconds
const controller = new AbortController()
setTimeout(() => controller.abort(), 5000)
try {
  await robot.media.playFgAudioFile({ uri: '/home/qtrobot/audio/long.wav', signal: controller.signal })
} catch { /* cancelled */ }

// Pause and resume
const controller2 = new AbortController()
const play = robot.media.playFgAudioFile({ uri: '/home/qtrobot/audio/music.wav', signal: controller2.signal })
await new Promise(r => setTimeout(r, 5000))
await robot.media.pauseFgAudioFile()
await new Promise(r => setTimeout(r, 3000))
await robot.media.resumeFgAudioFile()
await play

// FG + BG simultaneously
await robot.media.setBgAudioVolume({ value: 0.6 })
await Promise.all([
  robot.media.playBgAudioFile({ uri: '/home/qtrobot/audio/ambient.wav' }),
  robot.media.playFgAudioFile({ uri: '/home/qtrobot/audio/speech.wav' }),
])

// Stream raw PCM to FG lane
import { AudioFrameRaw } from '@luxai-qtrobot/magpie'

const writer = robot.media.openFgAudioStreamWriter()
const frame = new AudioFrameRaw({ channels: 1, sampleRate: 16000, bitDepth: 16, data: pcmBytes })
await writer.write(frame)
writer.close()
```

---

### Media — Video

Two video lanes (**FG** and **BG**) for file playback or raw RGBA frame streaming. The FG layer supports a transparency alpha channel that can be animated.

```typescript
robot.media.<method>(options)
```

**FG video:**

| Method | Returns | Description |
|---|---|---|
| `playFgVideoFile({ uri, speed?, with_audio?, signal? })` | `boolean` | Play FG video file (blocks until done) |
| `pauseFgVideoFile()` | `unknown` | Pause the current FG video |
| `resumeFgVideoFile()` | `unknown` | Resume the paused FG video |
| `cancelFgVideoStream()` | `unknown` | Stop the active FG video stream |
| `setFgVideoAlpha({ value })` | `unknown` | Set FG layer transparency `[0.0 transparent … 1.0 opaque]` |

**BG video:** same pattern — `playBgVideoFile`, `pauseBgVideoFile`, `resumeBgVideoFile`, `cancelBgVideoStream`.

**Frame streaming:**

| Method | Description |
|---|---|
| `openFgVideoStreamWriter()` | Open a writer to stream RGBA frames to the FG lane |
| `openBgVideoStreamWriter()` | Open a writer to stream RGBA frames to the BG lane |

**Examples:**

```typescript
// Play a video file, cancel after 3 seconds
const controller = new AbortController()
setTimeout(() => controller.abort(), 3000)
try {
  await robot.media.playBgVideoFile({ uri: '/home/qtrobot/video/intro.avi', signal: controller.signal })
} catch { /* cancelled */ }

// Adjust transparency
await robot.media.setFgVideoAlpha({ value: 0.0 })  // hidden
await robot.media.setFgVideoAlpha({ value: 0.5 })  // half-transparent
await robot.media.setFgVideoAlpha({ value: 1.0 })  // fully opaque

// Stream custom RGBA frames
import { ImageFrameRaw } from '@luxai-qtrobot/magpie'

await robot.media.setFgVideoAlpha({ value: 0.0 })
const writer = robot.media.openFgVideoStreamWriter()

const frame = new ImageFrameRaw({
  data: rgbaBytes,      // raw RGBA pixel data
  format: 'raw',
  width: 400,
  height: 280,
  channels: 4,
  pixelFormat: 'RGBA',
})
await writer.write(frame)
await robot.media.setFgVideoAlpha({ value: 1.0 })
writer.close()
```

---

### Speaker

Master speaker volume control — affects all audio output (TTS, media playback, streams).

```typescript
robot.speaker.<method>(options)
```

| Method | Returns | Description |
|---|---|---|
| `getVolume()` | `number` | Current master volume `[0.0, 1.0]` |
| `setVolume({ value })` | `boolean` | Set master volume |
| `mute()` | `boolean` | Mute the speaker |
| `unmute()` | `boolean` | Unmute the speaker |

```typescript
const vol = await robot.speaker.getVolume()
await robot.speaker.setVolume({ value: 0.8 })
await robot.speaker.mute()
await new Promise(r => setTimeout(r, 2000))
await robot.speaker.unmute()
```

---

### Microphone

Access to the internal mic array (up to 5 processed channels) and an optional external mic. Includes voice-activity detection (VAD) events and Respeaker DSP tuning.

```typescript
robot.microphone.<method>(options)
```

**Tuning:**

| Method | Returns | Description |
|---|---|---|
| `getIntTuning()` | `object` | All readable Respeaker DSP parameters |
| `setIntTuning({ name, value })` | `boolean` | Set a single DSP parameter (e.g. `AGCONOFF`) |

**Audio streams** (robot → your app):

| Method | Frame type | Description |
|---|---|---|
| `onIntAudioCh0(handler, onError?)` | `AudioFrameRaw` | Internal mic channel 0 (processed / ASR-ready) |
| `intAudioCh0Reader(options?)` | `AudioFrameRaw` | Async-iterable reader for channel 0 |
| `onIntAudioCh1..4(handler)` | `AudioFrameRaw` | Channels 1–4 |
| `onExtAudioCh0(handler, onError?)` | `AudioFrameRaw` | External mic channel 0 |
| `onIntEvent(handler, onError?)` | `object` | VAD + direction-of-arrival events |

> `AudioFrameRaw` properties: `sampleRate`, `bitDepth`, `channels`, `data` (`Uint8Array`).

**Examples:**

```typescript
import { AudioFrameRaw } from '@luxai-qtrobot/robot-sdk'
import { writeFileSync } from 'fs'

// Read DSP tuning
const params = await robot.microphone.getIntTuning()
await robot.microphone.setIntTuning({ name: 'AGCONOFF', value: 1 })   // enable AGC

// Capture 5 seconds of audio to a raw PCM file
const chunks: Uint8Array[] = []
let fmt = { sampleRate: 0, bitDepth: 0, channels: 0 }

const unsubscribe = robot.microphone.onIntAudioCh0((frame: AudioFrameRaw) => {
  if (!fmt.sampleRate) fmt = { sampleRate: frame.sampleRate, bitDepth: frame.bitDepth, channels: frame.channels }
  if (frame.data instanceof Uint8Array) chunks.push(frame.data)
})

await new Promise(r => setTimeout(r, 5000))
unsubscribe()

// Merge chunks and write to file
const total = chunks.reduce((n, c) => n + c.length, 0)
const buffer = new Uint8Array(total)
let offset = 0
for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length }
writeFileSync('recording.pcm', buffer)
console.log(`Play with: ffplay -f s${fmt.bitDepth}le -ar ${fmt.sampleRate} -ac ${fmt.channels} recording.pcm`)

// VAD + direction-of-arrival events
robot.microphone.onIntEvent((evt) => {
  if (evt['activity']) {
    console.log(`Voice detected — direction: ${evt['direction']}°`)
  }
})
```

---

## Plugin System

Plugins extend the SDK with hardware or services that run outside the robot's core firmware — for example, a RealSense depth camera or an ASR engine. Each plugin runs as a separate node with its own transport connection. Enable a plugin before accessing its API namespace.

### MQTT plugin

```typescript
// Connect to a plugin node over MQTT
await robot.enablePluginMqtt('camera', 'mqtt://192.168.1.100:1883', 'QTRD000320/realsense')

const intrinsics = await robot.camera!.getColorIntrinsics()
robot.disablePlugin('camera')
```

### WebRTC plugin

When the robot is connected via WebRTC, plugins can also connect via their own independent WebRTC peer connection. Signaling parameters (broker URL, TURN servers, etc.) are inherited from the robot connection automatically.

```typescript
const robot = await Robot.connectWebrtcMqtt('ws://192.168.1.100:9001', 'QTRD000320')

// Connect to the RealSense driver plugin via WebRTC
// nodeId is the WebRTC session ID configured on the robot for this plugin
await robot.enablePluginWebrtcMqtt('camera', 'qtrobot-realsense-driver')

const intrinsics = await robot.camera!.getColorIntrinsics()
robot.disablePlugin('camera')
```

Pass explicit options to override inherited signaling parameters (e.g. different broker or TURN servers):

```typescript
await robot.enablePluginWebrtcMqtt('camera', 'qtrobot-realsense-driver', {
  connectTimeoutSec: 30,
  webrtcOptions: { turnServers: [{ url: 'turn:...', username: '...', credential: '...' }] },
})
```

### WebRTC media tracks (`robot.extra` / `robot.camera.extra`)

When `use_media_channels=true` (the robot gateway default), native WebRTC media tracks are used for audio and video. Use `robot.extra` or `robot.camera.extra` to get the `MediaStreamTrack` and attach it to an `<audio>` or `<video>` element in the browser.

```typescript
// Robot microphone audio track (from the main robot connection)
const audioTrack = await robot.extra.getAudioTrack()
const audio = new Audio()
audio.srcObject = new MediaStream([audioTrack])
audio.play()

// Camera video track (from the camera plugin connection)
await robot.enablePluginWebrtcMqtt('camera', 'qtrobot-realsense-driver')
const videoTrack = await robot.camera!.extra.getVideoTrack()
videoEl.srcObject = new MediaStream([videoTrack])
videoEl.play()
```

> `getAudioTrack()` / `getVideoTrack()` throw `UnsupportedApiError` when the connection is not WebRTC or `use_media_channels=false`.

### Low-level plugin enabler

```typescript
// Construct a transport yourself (for custom protocols)
await robot.enablePlugin('camera', new MyCustomTransport(...))
```

---

## Examples

Ready-to-run examples are in the [`examples/`](examples/) directory. Run any example with:

```bash
npm run example:<name>
```

| Script | File | Demonstrates |
|---|---|---|
| `example:connect` | [`connect_mqtt.ts`](examples/connect_mqtt.ts) | All connection variants: basic, timeouts, WebSocket, manual transport, `using` statement |
| `example:tts` | [`tts_example.ts`](examples/tts_example.ts) | List engines, say text with options, cancel speech, SSML, voices, engine config |
| `example:face` | [`face_example.ts`](examples/face_example.ts) | List emotions, play animations, cancel, eye gaze control |
| `example:gesture` | [`gesture_example.ts`](examples/gesture_example.ts) | List gestures, play with cancel, interactive record/playback/save |
| `example:motor` | [`motor_example.ts`](examples/motor_example.ts) | List motors, joint state streams (callback + iterator), direct joint commands, home all |
| `example:microphone` | [`microphone_example.ts`](examples/microphone_example.ts) | Capture raw PCM audio from the internal microphone |
| `example:media:audio` | [`media_audio_example.ts`](examples/media_audio_example.ts) | Volume control, FG/BG file playback, pause/resume, cancel, online audio |
| `example:media:video` | [`media_video_example.ts`](examples/media_video_example.ts) | BG video file playback, pause/resume, FG alpha transparency, cancel |
| `example:speaker` | [`speaker_example.ts`](examples/speaker_example.ts) | Get/set master volume, mute/unmute |

### Web browser examples

Interactive HTML pages in [`examples/web/`](examples/web/). Most features have two variants — **MQTT** (direct broker connection) and **WebRTC** (P2P data channel, MQTT only for signaling). Open the files directly in a browser after building the SDK (`npm run build`).

| Feature | MQTT | WebRTC | Demonstrates |
|---|---|---|---|
| Face | [`mqtt/face.html`](examples/web/mqtt/face.html) | [`webrtc/face.html`](examples/web/webrtc/face.html) | List emotions, play with speed control + cancel, eye gaze |
| Gesture | [`mqtt/gesture.html`](examples/web/mqtt/gesture.html) | [`webrtc/gesture.html`](examples/web/webrtc/gesture.html) | List gestures, play with speed factor + cancel |
| Motor | [`mqtt/motor.html`](examples/web/mqtt/motor.html) | [`webrtc/motor.html`](examples/web/webrtc/motor.html) | Live joint state table, direct joint position/velocity commands |
| TTS | [`mqtt/tts.html`](examples/web/mqtt/tts.html) | [`webrtc/tts.html`](examples/web/webrtc/tts.html) | Speak text with engine/voice/rate/pitch, cancel; engine info |
| Speaker | [`mqtt/speaker.html`](examples/web/mqtt/speaker.html) | [`webrtc/speaker.html`](examples/web/webrtc/speaker.html) | Master volume slider, mute/unmute |
| Audio | [`mqtt/audio.html`](examples/web/mqtt/audio.html) | [`webrtc/audio.html`](examples/web/webrtc/audio.html) | FG/BG file and stream playback, per-lane volume, pause/resume/cancel |
| Video | [`mqtt/video.html`](examples/web/mqtt/video.html) | [`webrtc/video.html`](examples/web/webrtc/video.html) | FG/BG video file playback, FG alpha slider, pause/resume/cancel |
| Microphone | — | [`webrtc/microphone.html`](examples/web/webrtc/microphone.html) | Live robot mic audio via WebRTC media track, mute/unmute |
| Camera | — | [`webrtc/camera.html`](examples/web/webrtc/camera.html) | Live camera video via plugin WebRTC peer (`enablePluginWebrtcMqtt`), color intrinsics |

---

## License

This project is licensed under the **GNU General Public License v3.0** (GPL-3.0).
See the [LICENSE](LICENSE) file for the full text.

© LuxAI S.A.
