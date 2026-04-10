export { Robot } from './client'
export { Logger } from '@luxai-qtrobot/magpie'
export type { ConnectOptions, ConnectWebrtcMqttOptions } from './client'

export { RobotApiError, withSignal } from './actions'
export { TypedStreamReader, TypedStreamWriter } from './streams'
export { Transport, MqttTransport, WebRtcTransport, UnsupportedApiError } from './transport'
export type { WebRtcSignalingParams } from './transport'

// Re-export WebRTC option types for users building custom transports
export type { WebRtcOptions, WebRtcTurnServer } from '@luxai-qtrobot/magpie'

// Frame types
export { JointStateFrame } from './frames/joint_state'
export { JointCommandFrame, JointTrajectoryFrame } from './frames/joint_command'
export { LedColorFrame } from './frames/led'

// Re-export magpie frames used by stream APIs
export { AudioFrameRaw, AudioFrameFlac, ImageFrameRaw, ImageFrameJpeg } from '@luxai-qtrobot/magpie'

// API namespace types (for use in type annotations)
export type { TtsSayTextOptions, TtsSaySsmlOptions, TtsSetConfigOptions, TtsGetConfigOptions, TtsGetLanguagesOptions, TtsGetVoicesOptions, TtsSupportsSsmlOptions } from './api/tts'
export type { FaceShowEmotionOptions, FaceLookOptions } from './api/face'
export type { GesturePlayOptions, GesturePlayFileOptions, GestureRecordOptions, GestureStoreRecordOptions } from './api/gesture'
export type { MotorOnOptions, MotorOffOptions, MotorHomeOptions, MotorSetVelocityOptions, MotorSetCalibOptions } from './api/motor'
export type { MicrophoneSetIntTuningOptions } from './api/microphone'
export type { MediaPlayFgAudioFileOptions, MediaSetFgAudioVolumeOptions, MediaPlayBgAudioFileOptions, MediaSetBgAudioVolumeOptions, MediaPlayFgVideoFileOptions, MediaSetFgVideoAlphaOptions, MediaPlayBgVideoFileOptions } from './api/media'
export type { SpeakerSetVolumeOptions } from './api/speaker'
export type { CameraApi } from './api/camera'
export { ExtraApi } from './api/extra'
