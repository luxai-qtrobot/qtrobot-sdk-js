// RPC service paths — must match qtrobot-service-hub-gateway-mqtt bridge config

// TTS
export const TTS_SAY_TEXT           = '/tts/engine/say/text'
export const TTS_SAY_SSML           = '/tts/engine/say/ssml'
export const TTS_CANCEL             = '/tts/engine/cancel'
export const TTS_LIST_ENGINES       = '/tts/engines/list'
export const TTS_GET_DEFAULT_ENGINE = '/tts/default_engine/get'
export const TTS_SET_DEFAULT_ENGINE = '/tts/default_engine/set'
export const TTS_GET_CONFIG         = '/tts/engine/configure/get'
export const TTS_SET_CONFIG         = '/tts/engine/configure/set'
export const TTS_GET_LANGUAGES      = '/tts/engine/languages/get'
export const TTS_GET_VOICES         = '/tts/engine/voices/get'
export const TTS_SUPPORTS_SSML      = '/tts/engine/supports/ssml'

// Face
export const FACE_SHOW_EMOTION      = '/face/emotion/show'
export const FACE_STOP_EMOTION      = '/face/emotion/stop'
export const FACE_LIST_EMOTIONS     = '/face/emotion/list'
export const FACE_LOOK              = '/face/look'

// Gesture
export const GESTURE_PLAY           = '/gesture/play'
export const GESTURE_PLAY_FILE      = '/gesture/file/play'
export const GESTURE_LIST_FILES     = '/gesture/file/list'
export const GESTURE_CANCEL         = '/gesture/cancel'

// Motor
export const MOTOR_LIST             = '/motor/list'
export const MOTOR_ON               = '/motor/on'
export const MOTOR_OFF              = '/motor/off'
export const MOTOR_ON_ALL           = '/motor/on/all'
export const MOTOR_OFF_ALL          = '/motor/off/all'
export const MOTOR_MOVE_HOME        = '/motor/move/home'
export const MOTOR_MOVE_HOME_ALL    = '/motor/move/home/all'
export const MOTOR_SET_VELOCITY     = '/motor/velocity/set'
export const MOTOR_SET_CALIB        = '/motor/calib/set'
export const MOTOR_CALIB_ALL        = '/motor/calib/all'

// Motor streams (canonical topic paths from system description)
export const MOTOR_JOINTS_STATE_STREAM   = '/motor/joints/state/stream:o'
export const MOTOR_JOINTS_COMMAND_STREAM = '/motor/joints/command/stream:i'
export const MOTOR_JOINTS_ERROR_STREAM   = '/motor/joints/error/stream:o'

// Microphone streams
export const MIC_INT_AUDIO_CH0_STREAM = '/mic/int/audio/ch0/stream:o'
export const MIC_INT_AUDIO_CH1_STREAM = '/mic/int/audio/ch1/stream:o'
export const MIC_INT_AUDIO_CH2_STREAM = '/mic/int/audio/ch2/stream:o'
export const MIC_INT_AUDIO_CH3_STREAM = '/mic/int/audio/ch3/stream:o'
export const MIC_INT_AUDIO_CH4_STREAM = '/mic/int/audio/ch4/stream:o'
export const MIC_INT_EVENT_STREAM     = '/mic/int/event/stream:o'
export const MIC_EXT_AUDIO_CH0_STREAM = '/mic/ext/audio/ch0/stream:o'

// Media
export const MEDIA_AUDIO_FG_PLAY        = '/media/audio/fg/file/play'
export const MEDIA_AUDIO_FG_CANCEL      = '/media/audio/fg/file/cancel'
export const MEDIA_AUDIO_FG_PAUSE       = '/media/audio/fg/file/pause'
export const MEDIA_AUDIO_FG_RESUME      = '/media/audio/fg/file/resume'
export const MEDIA_AUDIO_FG_VOLUME_SET  = '/media/audio/fg/volume/set'
export const MEDIA_AUDIO_FG_VOLUME_GET  = '/media/audio/fg/volume/get'
export const MEDIA_AUDIO_FG_STREAM_CANCEL  = '/media/audio/fg/stream/cancel'
export const MEDIA_AUDIO_FG_STREAM_PAUSE   = '/media/audio/fg/stream/pause'
export const MEDIA_AUDIO_FG_STREAM_RESUME  = '/media/audio/fg/stream/resume'
export const MEDIA_AUDIO_BG_PLAY        = '/media/audio/bg/file/play'
export const MEDIA_AUDIO_BG_CANCEL      = '/media/audio/bg/file/cancel'
export const MEDIA_AUDIO_BG_PAUSE       = '/media/audio/bg/file/pause'
export const MEDIA_AUDIO_BG_RESUME      = '/media/audio/bg/file/resume'
export const MEDIA_AUDIO_BG_VOLUME_SET  = '/media/audio/bg/volume/set'
export const MEDIA_AUDIO_BG_VOLUME_GET  = '/media/audio/bg/volume/get'
export const MEDIA_VIDEO_FG_PLAY        = '/media/video/fg/file/play'
export const MEDIA_VIDEO_FG_CANCEL      = '/media/video/fg/file/cancel'
export const MEDIA_VIDEO_FG_PAUSE       = '/media/video/fg/file/pause'
export const MEDIA_VIDEO_FG_RESUME      = '/media/video/fg/file/resume'
export const MEDIA_VIDEO_FG_SET_ALPHA   = '/media/video/fg/set_alpha'
export const MEDIA_VIDEO_FG_STREAM_CANCEL  = '/media/video/fg/stream/cancel'
export const MEDIA_VIDEO_BG_PLAY        = '/media/video/bg/file/play'
export const MEDIA_VIDEO_BG_CANCEL      = '/media/video/bg/file/cancel'
export const MEDIA_VIDEO_BG_PAUSE       = '/media/video/bg/file/pause'
export const MEDIA_VIDEO_BG_RESUME      = '/media/video/bg/file/resume'

// Media streams
export const MEDIA_AUDIO_FG_STREAM = '/media/audio/fg/stream:i'
export const MEDIA_AUDIO_BG_STREAM = '/media/audio/bg/stream:i'
export const MEDIA_VIDEO_FG_STREAM = '/media/video/fg/stream:i'
export const MEDIA_VIDEO_BG_STREAM = '/media/video/bg/stream:i'

// Speaker
export const SPEAKER_VOLUME_SET   = '/speaker/volume/set'
export const SPEAKER_VOLUME_GET   = '/speaker/volume/get'
export const SPEAKER_MUTE         = '/speaker/volume/mute'
export const SPEAKER_UNMUTE       = '/speaker/volume/unmute'

// Microphone
export const MICROPHONE_INT_TUNING_GET = '/microphone/int/tunning/get'
export const MICROPHONE_INT_TUNING_SET = '/microphone/int/tunning/set'

// Gesture stream
export const GESTURE_PROGRESS_STREAM = '/gesture/progress/stream:o'
