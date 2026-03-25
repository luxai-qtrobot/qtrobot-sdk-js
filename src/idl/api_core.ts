/**
 * Core API IDL for QTrobot.
 * Edit this file and run `npm run gen` to regenerate src/api/*.ts.
 */

import type { RpcEntry, StreamEntry } from './types'

export const CORE_RPC: Record<string, RpcEntry> = {

  // ── TTS ─────────────────────────────────────────────────────────────────

  'tts.say_text': {
    service: '/tts/engine/say/text',
    cancel: '/tts/engine/cancel',
    params: [
      { name: 'text',   type: 'string',  doc: 'Plain text to synthesize.' },
      { name: 'engine', type: 'string',  optional: true, default: null, doc: 'Engine id (uses default if omitted).' },
      { name: 'lang',   type: 'string',  optional: true, default: null, doc: 'Language code, e.g. "en-US".' },
      { name: 'voice',  type: 'string',  optional: true, default: null, doc: 'Voice id or name.' },
      { name: 'rate',   type: 'number',  optional: true, default: null, doc: 'Speech rate multiplier.' },
      { name: 'pitch',  type: 'number',  optional: true, default: null, doc: 'Pitch adjustment.' },
      { name: 'volume', type: 'number',  optional: true, default: null, doc: 'Volume level.' },
      { name: 'style',  type: 'string',  optional: true, default: null, doc: 'Speaking style (engine-dependent).' },
    ],
    returns: 'void',
    doc: 'Speak plain text. Blocks until audio playback completes.',
  },

  'tts.say_ssml': {
    service: '/tts/engine/say/ssml',
    cancel: '/tts/engine/cancel',
    params: [
      { name: 'ssml',   type: 'string', doc: 'SSML markup string.' },
      { name: 'engine', type: 'string', optional: true, default: null, doc: 'Engine id (uses default if omitted).' },
    ],
    returns: 'void',
    doc: 'Speak SSML markup. Blocks until audio playback completes.',
  },

  'tts.set_default_engine': {
    service: '/tts/default_engine/set',
    params: [
      { name: 'engine', type: 'string', doc: 'Engine id, e.g. "acapela" or "azure".' },
    ],
    returns: 'void',
    doc: 'Set the default TTS engine.',
  },

  'tts.get_default_engine': {
    service: '/tts/default_engine/get',
    params: [],
    returns: 'string',
    doc: 'Get the current default TTS engine id.',
  },

  'tts.list_engines': {
    service: '/tts/engines/list',
    params: [],
    returns: 'array',
    doc: 'List available TTS engine ids.',
  },

  'tts.set_config': {
    service: '/tts/engine/configure/set',
    params: [
      { name: 'config', type: 'object', doc: 'Engine-specific config key/value pairs.' },
      { name: 'engine', type: 'string', optional: true, default: null, doc: 'Engine id (uses default if omitted).' },
    ],
    returns: 'void',
    doc: 'Set engine configuration.',
  },

  'tts.get_config': {
    service: '/tts/engine/configure/get',
    params: [
      { name: 'engine', type: 'string', optional: true, default: null, doc: 'Engine id (uses default if omitted).' },
    ],
    returns: 'object',
    doc: 'Get current engine configuration.',
  },

  'tts.get_languages': {
    service: '/tts/engine/languages/get',
    params: [
      { name: 'engine', type: 'string', optional: true, default: null, doc: 'Engine id (uses default if omitted).' },
    ],
    returns: 'array',
    doc: 'Get supported language codes for an engine.',
  },

  'tts.get_voices': {
    service: '/tts/engine/voices/get',
    params: [
      { name: 'engine', type: 'string', optional: true, default: null, doc: 'Engine id (uses default if omitted).' },
    ],
    returns: 'array',
    doc: 'Get available voices for an engine.',
  },

  'tts.supports_ssml': {
    service: '/tts/engine/supports/ssml',
    params: [
      { name: 'engine', type: 'string', optional: true, default: null, doc: 'Engine id (uses default if omitted).' },
    ],
    returns: 'boolean',
    doc: 'Check whether an engine supports SSML.',
  },

  // ── FACE ────────────────────────────────────────────────────────────────

  'face.show_emotion': {
    service: '/face/emotion/show',
    cancel: '/face/emotion/stop',
    params: [
      { name: 'emotion', type: 'string', doc: 'Emotion name or relative path (with or without .avi).' },
      { name: 'speed',   type: 'number', optional: true, default: null, doc: 'Playback speed factor (uses config default if omitted).' },
    ],
    returns: 'void',
    doc: 'Show an emotion animation on the robot face. Blocks until the animation finishes.',
  },

  'face.list_emotions': {
    service: '/face/emotion/list',
    params: [],
    returns: 'array',
    doc: 'List available emotion animation paths.',
  },

  'face.look': {
    service: '/face/look',
    params: [
      { name: 'l_eye',    type: 'array',  doc: '[dx, dy] pixel offset from centre for the left eye.' },
      { name: 'r_eye',    type: 'array',  doc: '[dx, dy] pixel offset from centre for the right eye.' },
      { name: 'duration', type: 'number', optional: true, default: 0.0, doc: 'If > 0, eyes reset to centre after this many seconds.' },
    ],
    returns: 'void',
    doc: 'Move the robot eyes.',
  },

  // ── GESTURE ─────────────────────────────────────────────────────────────

  'gesture.play': {
    service: '/gesture/play',
    cancel: '/gesture/cancel',
    params: [
      { name: 'keyframes',     type: 'object',  doc: 'Keyframes trajectory dict.' },
      { name: 'resample',      type: 'boolean', optional: true, default: true,  doc: 'Resample trajectory to a uniform rate.' },
      { name: 'rate_hz',       type: 'number',  optional: true, default: 100.0, doc: 'Resample rate in Hz.' },
      { name: 'speed_factor',  type: 'number',  optional: true, default: 1.0,   doc: 'Playback speed multiplier.' },
    ],
    returns: 'void',
    doc: 'Play a gesture from keyframe data. Blocks until the gesture finishes.',
  },

  'gesture.play_file': {
    service: '/gesture/file/play',
    cancel: '/gesture/cancel',
    params: [
      { name: 'gesture',      type: 'string', doc: 'Gesture name or path (with or without .xml).' },
      { name: 'speed_factor', type: 'number', optional: true, default: 1.0, doc: 'Playback speed multiplier.' },
    ],
    returns: 'boolean',
    doc: 'Play a gesture file by name. Blocks until the gesture finishes.',
  },

  'gesture.list_files': {
    service: '/gesture/file/list',
    params: [],
    returns: 'array',
    doc: 'List available gesture file paths.',
  },

  'gesture.record': {
    service: '/gesture/record/start',
    cancel: '/gesture/record/stop',
    params: [
      { name: 'motors',             type: 'array',   doc: 'Motor names to record.' },
      { name: 'release_motors',     type: 'boolean', optional: true, default: false,   doc: 'Disable motor torque during recording.' },
      { name: 'delay_start_ms',     type: 'number',  optional: true, default: 0,       doc: 'Delay before recording starts (ms).' },
      { name: 'timeout_ms',         type: 'number',  optional: true, default: 60000,   doc: 'Maximum recording duration (ms).' },
      { name: 'refine_keyframe',    type: 'boolean', optional: true, default: true,    doc: 'Remove redundant keyframes after recording.' },
      { name: 'keyframe_pos_eps',   type: 'number',  optional: true, default: 0.75,   doc: 'Position epsilon for keyframe refinement (degrees).' },
      { name: 'keyframe_max_gap_us',type: 'number',  optional: true, default: 100000, doc: 'Maximum gap between keyframes (microseconds).' },
    ],
    returns: 'object',
    doc: 'Record a gesture trajectory. Blocks until recording is stopped or times out.',
  },

  'gesture.stop_record': {
    service: '/gesture/record/stop',
    params: [],
    returns: 'boolean',
    doc: 'Stop an in-progress gesture recording. Returns true if recording was active.',
  },

  'gesture.store_record': {
    service: '/gesture/record/store',
    params: [
      { name: 'gesture', type: 'string', doc: 'Name or relative path to save the recorded gesture as XML.' },
    ],
    returns: 'void',
    doc: 'Save the last recorded gesture to a file.',
  },

  // ── MOTOR ────────────────────────────────────────────────────────────────

  'motor.list': {
    service: '/motor/list',
    params: [],
    returns: 'object',
    doc: 'List available motors and their configuration properties.',
  },

  'motor.on': {
    service: '/motor/on',
    params: [{ name: 'motor', type: 'string', doc: 'Motor name to enable torque.' }],
    returns: 'void',
    doc: 'Enable torque for a motor.',
  },

  'motor.off': {
    service: '/motor/off',
    params: [{ name: 'motor', type: 'string', doc: 'Motor name to disable torque.' }],
    returns: 'void',
    doc: 'Disable torque for a motor.',
  },

  'motor.on_all': {
    service: '/motor/on/all',
    params: [],
    returns: 'void',
    doc: 'Enable torque for all motors.',
  },

  'motor.off_all': {
    service: '/motor/off/all',
    params: [],
    returns: 'void',
    doc: 'Disable torque for all motors.',
  },

  'motor.home': {
    service: '/motor/move/home',
    params: [{ name: 'motor', type: 'string', doc: 'Motor name to move to its home position.' }],
    returns: 'void',
    doc: 'Move a motor to its home position.',
  },

  'motor.home_all': {
    service: '/motor/move/home/all',
    params: [],
    returns: 'void',
    doc: 'Move all motors to their home positions.',
  },

  'motor.set_velocity': {
    service: '/motor/velocity/set',
    params: [
      { name: 'motor',    type: 'string', doc: 'Motor name.' },
      { name: 'velocity', type: 'number', doc: 'Velocity value (0 .. velocity_max).' },
    ],
    returns: 'void',
    doc: 'Set the velocity limit for a motor.',
  },

  'motor.set_calib': {
    service: '/motor/calib/set',
    params: [
      { name: 'motor',              type: 'string',  doc: 'Motor name.' },
      { name: 'offset',             type: 'number',  optional: true, default: null,  doc: 'Calibration offset in degrees.' },
      { name: 'overload_threshold', type: 'number',  optional: true, default: null,  doc: 'Overload threshold value.' },
      { name: 'velocity_max',       type: 'number',  optional: true, default: null,  doc: 'Maximum velocity value.' },
      { name: 'store',              type: 'boolean', optional: true, default: false, doc: 'Persist the calibration to config file.' },
    ],
    returns: 'void',
    doc: 'Set calibration parameters for a motor.',
  },

  'motor.calib_all': {
    service: '/motor/calib/all',
    params: [],
    returns: 'void',
    doc: 'Apply stored calibration to all motors.',
  },

  // ── MICROPHONE ──────────────────────────────────────────────────────────

  'microphone.get_int_tuning': {
    service: '/microphone/int/tunning/get',
    params: [],
    returns: 'object',
    doc: 'Get all internal microphone tuning parameters (e.g. AECNORM, VOICEACTIVITY).',
  },

  'microphone.set_int_tuning': {
    service: '/microphone/int/tunning/set',
    params: [
      { name: 'name',  type: 'string', doc: 'Respeaker parameter name, e.g. "AECNORM".' },
      { name: 'value', type: 'number', doc: 'Numeric value to set.' },
    ],
    returns: 'boolean',
    doc: 'Set a single internal microphone tuning parameter.',
  },

  // ── MEDIA — Audio Foreground ─────────────────────────────────────────────

  'media.play_fg_audio_file': {
    service: '/media/audio/fg/file/play',
    cancel: '/media/audio/fg/file/cancel',
    params: [{ name: 'uri', type: 'string', doc: 'Path or URI of the audio file.' }],
    returns: 'boolean',
    doc: 'Play a foreground audio file. Blocks until playback finishes.',
  },

  'media.pause_fg_audio_file': {
    service: '/media/audio/fg/file/pause',
    params: [],
    returns: 'void',
    doc: 'Pause the foreground audio file currently playing.',
  },

  'media.resume_fg_audio_file': {
    service: '/media/audio/fg/file/resume',
    params: [],
    returns: 'void',
    doc: 'Resume the paused foreground audio file.',
  },

  'media.cancel_fg_audio_stream': {
    service: '/media/audio/fg/stream/cancel',
    params: [],
    returns: 'void',
    doc: 'Cancel the active foreground audio stream.',
  },

  'media.pause_fg_audio_stream': {
    service: '/media/audio/fg/stream/pause',
    params: [],
    returns: 'void',
    doc: 'Pause the foreground audio stream.',
  },

  'media.resume_fg_audio_stream': {
    service: '/media/audio/fg/stream/resume',
    params: [],
    returns: 'void',
    doc: 'Resume the paused foreground audio stream.',
  },

  'media.set_fg_audio_volume': {
    service: '/media/audio/fg/volume/set',
    params: [{ name: 'value', type: 'number', doc: 'Volume level in [0.0, 1.0].' }],
    returns: 'void',
    doc: 'Set the foreground audio playback volume.',
  },

  'media.get_fg_audio_volume': {
    service: '/media/audio/fg/volume/get',
    params: [],
    returns: 'number',
    doc: 'Get the current foreground audio playback volume.',
  },

  // ── MEDIA — Audio Background ─────────────────────────────────────────────

  'media.play_bg_audio_file': {
    service: '/media/audio/bg/file/play',
    cancel: '/media/audio/bg/file/cancel',
    params: [{ name: 'uri', type: 'string', doc: 'Path or URI of the audio file.' }],
    returns: 'boolean',
    doc: 'Play a background audio file. Blocks until playback finishes.',
  },

  'media.pause_bg_audio_file': {
    service: '/media/audio/bg/file/pause',
    params: [],
    returns: 'void',
    doc: 'Pause the background audio file currently playing.',
  },

  'media.resume_bg_audio_file': {
    service: '/media/audio/bg/file/resume',
    params: [],
    returns: 'void',
    doc: 'Resume the paused background audio file.',
  },

  'media.cancel_bg_audio_stream': {
    service: '/media/audio/bg/stream/cancel',
    params: [],
    returns: 'void',
    doc: 'Cancel the active background audio stream.',
  },

  'media.pause_bg_audio_stream': {
    service: '/media/audio/bg/stream/pause',
    params: [],
    returns: 'void',
    doc: 'Pause the background audio stream.',
  },

  'media.resume_bg_audio_stream': {
    service: '/media/audio/bg/stream/resume',
    params: [],
    returns: 'void',
    doc: 'Resume the paused background audio stream.',
  },

  'media.set_bg_audio_volume': {
    service: '/media/audio/bg/volume/set',
    params: [{ name: 'value', type: 'number', doc: 'Volume level in [0.0, 1.0].' }],
    returns: 'void',
    doc: 'Set the background audio playback volume.',
  },

  'media.get_bg_audio_volume': {
    service: '/media/audio/bg/volume/get',
    params: [],
    returns: 'number',
    doc: 'Get the current background audio playback volume.',
  },

  // ── MEDIA — Video Foreground ─────────────────────────────────────────────

  'media.play_fg_video_file': {
    service: '/media/video/fg/file/play',
    cancel: '/media/video/fg/file/cancel',
    params: [
      { name: 'uri',        type: 'string',  doc: 'Path or URI of the video file.' },
      { name: 'speed',      type: 'number',  optional: true, default: 1.0,   doc: 'Playback speed multiplier.' },
      { name: 'with_audio', type: 'boolean', optional: true, default: false, doc: 'Play embedded audio track.' },
    ],
    returns: 'boolean',
    doc: 'Play a foreground video file. Blocks until playback finishes.',
  },

  'media.pause_fg_video_file': {
    service: '/media/video/fg/file/pause',
    params: [],
    returns: 'void',
    doc: 'Pause the foreground video file currently playing.',
  },

  'media.resume_fg_video_file': {
    service: '/media/video/fg/file/resume',
    params: [],
    returns: 'void',
    doc: 'Resume the paused foreground video file.',
  },

  'media.cancel_fg_video_stream': {
    service: '/media/video/fg/stream/cancel',
    params: [],
    returns: 'void',
    doc: 'Cancel the active foreground video stream.',
  },

  'media.pause_fg_video_stream': {
    service: '/media/video/fg/stream/pause',
    params: [],
    returns: 'void',
    doc: 'Pause the foreground video stream.',
  },

  'media.resume_fg_video_stream': {
    service: '/media/video/fg/stream/resume',
    params: [],
    returns: 'void',
    doc: 'Resume the paused foreground video stream.',
  },

  'media.set_fg_video_alpha': {
    service: '/media/video/fg/set_alpha',
    params: [{ name: 'value', type: 'number', doc: 'Alpha transparency in [0.0, 1.0].' }],
    returns: 'void',
    doc: 'Set the foreground video layer transparency.',
  },

  // ── MEDIA — Video Background ─────────────────────────────────────────────

  'media.play_bg_video_file': {
    service: '/media/video/bg/file/play',
    cancel: '/media/video/bg/file/cancel',
    params: [
      { name: 'uri',        type: 'string',  doc: 'Path or URI of the video file.' },
      { name: 'speed',      type: 'number',  optional: true, default: 1.0,   doc: 'Playback speed multiplier.' },
      { name: 'with_audio', type: 'boolean', optional: true, default: false, doc: 'Play embedded audio track.' },
    ],
    returns: 'boolean',
    doc: 'Play a background video file. Blocks until playback finishes.',
  },

  'media.pause_bg_video_file': {
    service: '/media/video/bg/file/pause',
    params: [],
    returns: 'void',
    doc: 'Pause the background video file currently playing.',
  },

  'media.resume_bg_video_file': {
    service: '/media/video/bg/file/resume',
    params: [],
    returns: 'void',
    doc: 'Resume the paused background video file.',
  },

  'media.cancel_bg_video_stream': {
    service: '/media/video/bg/stream/cancel',
    params: [],
    returns: 'void',
    doc: 'Cancel the active background video stream.',
  },

  'media.pause_bg_video_stream': {
    service: '/media/video/bg/stream/pause',
    params: [],
    returns: 'void',
    doc: 'Pause the background video stream.',
  },

  'media.resume_bg_video_stream': {
    service: '/media/video/bg/stream/resume',
    params: [],
    returns: 'void',
    doc: 'Resume the paused background video stream.',
  },

  // ── SPEAKER ─────────────────────────────────────────────────────────────

  'speaker.set_volume': {
    service: '/speaker/volume/set',
    params: [{ name: 'value', type: 'number', doc: 'Master speaker volume in [0.0, 1.0].' }],
    returns: 'boolean',
    doc: 'Set the master speaker volume.',
  },

  'speaker.get_volume': {
    service: '/speaker/volume/get',
    params: [],
    returns: 'number',
    doc: 'Get the current master speaker volume.',
  },

  'speaker.mute': {
    service: '/speaker/volume/mute',
    params: [],
    returns: 'boolean',
    doc: 'Mute the speaker.',
  },

  'speaker.unmute': {
    service: '/speaker/volume/unmute',
    params: [],
    returns: 'boolean',
    doc: 'Unmute the speaker.',
  },
}

export const CORE_STREAM: Record<string, StreamEntry> = {

  // ── MOTOR streams ────────────────────────────────────────────────────────

  'motor.joints_state': {
    topic: '/motor/joints/state/stream:o',
    direction: 'out',
    frameClass: 'JointStateFrame',
    queueSize: 2,
    doc: 'Outbound joint state stream (position, velocity, effort, voltage, temperature).',
  },

  'motor.joints_error': {
    topic: '/motor/joints/error/stream:o',
    direction: 'out',
    frameClass: 'DictValue',
    queueSize: 2,
    doc: 'Outbound joint error stream (overload, voltage, temperature, sensor failure flags).',
  },

  'motor.joints_command': {
    topic: '/motor/joints/command/stream:i',
    direction: 'in',
    frameClass: 'JointCommandFrame',
    queueSize: 10,
    doc: 'Inbound joint command stream — send position/velocity commands to motors.',
  },

  // ── GESTURE streams ──────────────────────────────────────────────────────

  'gesture.progress': {
    topic: '/gesture/progress/stream:o',
    direction: 'out',
    frameClass: 'DictValue',
    queueSize: 2,
    doc: 'Outbound gesture playback progress events.',
  },

  // ── MICROPHONE streams ───────────────────────────────────────────────────

  'microphone.int_audio_ch0': {
    topic: '/mic/int/audio/ch0/stream:o',
    direction: 'out',
    frameClass: 'AudioFrameRaw',
    queueSize: 10,
    doc: 'Outbound raw PCM audio from internal microphone channel 0.',
  },

  'microphone.int_audio_ch1': {
    topic: '/mic/int/audio/ch1/stream:o',
    direction: 'out',
    frameClass: 'AudioFrameRaw',
    queueSize: 10,
    doc: 'Outbound raw PCM audio from internal microphone channel 1.',
  },

  'microphone.int_audio_ch2': {
    topic: '/mic/int/audio/ch2/stream:o',
    direction: 'out',
    frameClass: 'AudioFrameRaw',
    queueSize: 10,
    doc: 'Outbound raw PCM audio from internal microphone channel 2.',
  },

  'microphone.int_audio_ch3': {
    topic: '/mic/int/audio/ch3/stream:o',
    direction: 'out',
    frameClass: 'AudioFrameRaw',
    queueSize: 10,
    doc: 'Outbound raw PCM audio from internal microphone channel 3.',
  },

  'microphone.int_audio_ch4': {
    topic: '/mic/int/audio/ch4/stream:o',
    direction: 'out',
    frameClass: 'AudioFrameRaw',
    queueSize: 10,
    doc: 'Outbound raw PCM audio from internal microphone channel 4.',
  },

  'microphone.int_event': {
    topic: '/mic/int/event/stream:o',
    direction: 'out',
    frameClass: 'DictValue',
    queueSize: 2,
    doc: 'Outbound voice-activity and direction events from the internal microphone array.',
  },

  'microphone.ext_audio_ch0': {
    topic: '/mic/ext/audio/ch0/stream:o',
    direction: 'out',
    frameClass: 'AudioFrameRaw',
    queueSize: 10,
    doc: 'Outbound raw PCM audio from external microphone channel 0.',
  },

  // ── MEDIA streams ────────────────────────────────────────────────────────

  'media.fg_audio_stream': {
    topic: '/media/audio/fg/stream:i',
    direction: 'in',
    frameClass: 'AudioFrameRaw',
    queueSize: 10,
    doc: 'Inbound foreground audio stream — push AudioFrameRaw frames to play audio on the robot.',
  },

  'media.bg_audio_stream': {
    topic: '/media/audio/bg/stream:i',
    direction: 'in',
    frameClass: 'AudioFrameRaw',
    queueSize: 10,
    doc: 'Inbound background audio stream — push AudioFrameRaw frames to play audio on the robot.',
  },

  'media.fg_video_stream': {
    topic: '/media/video/fg/stream:i',
    direction: 'in',
    frameClass: 'ImageFrameRaw',
    queueSize: 0,
    doc: 'Inbound foreground video stream — push ImageFrameRaw frames to display video on the robot.',
  },

  'media.bg_video_stream': {
    topic: '/media/video/bg/stream:i',
    direction: 'in',
    frameClass: 'ImageFrameRaw',
    queueSize: 0,
    doc: 'Inbound background video stream — push ImageFrameRaw frames to display video on the robot.',
  },
}
