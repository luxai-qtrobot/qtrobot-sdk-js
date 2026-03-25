export { Robot } from './client'
export type { ConnectOptions } from './client'

export { ActionHandle, RobotApiError, ActionCancelledError } from './actions'
export { TypedStreamReader, TypedStreamWriter } from './streams'
export { UnsupportedApiError } from './transport'

// Frame types
export { JointStateFrame } from './frames/joint_state'
export { JointCommandFrame, JointTrajectoryFrame } from './frames/joint_command'
export { LedColorFrame } from './frames/led'

// Re-export magpie frames used by stream APIs
export { AudioFrameRaw, AudioFrameFlac, ImageFrameRaw, ImageFrameJpeg } from '@luxai-qtrobot/magpie'

// API namespace types (for use in type annotations)
export type { TtsSayTextOptions } from './api/tts'
export type { GesturePlayOptions } from './api/gesture'
export type { GestureRecordOptions } from './api/gesture'
export type { MotorSetCalibOptions } from './api/motor'
export type { MediaPlayFgVideoFileOptions } from './api/media'
export type { MediaPlayBgVideoFileOptions } from './api/media'
export type { CameraApi } from './api/camera'
