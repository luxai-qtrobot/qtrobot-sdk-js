/**
 * IDL type definitions for the QTrobot SDK API generator.
 * These types describe every RPC service and stream exposed by the robot.
 * Edit api_core.ts or api_plugins.ts and run `npm run gen` to regenerate the API files.
 */

export type ParamType = 'string' | 'number' | 'boolean' | 'object' | 'array'

export type ParamDef = {
  /** Parameter name in snake_case — used as the key in the RPC args dict */
  name: string
  type: ParamType
  /** Whether the parameter is optional */
  optional?: boolean
  /** Default value for optional params (used in generated JSDoc) */
  default?: unknown
  /** Description shown in JSDoc @param */
  doc: string
}

export type ReturnType = 'boolean' | 'number' | 'string' | 'object' | 'array' | 'unknown'

export type RpcEntry = {
  /** Canonical service path on the robot, e.g. '/tts/engine/say/text' */
  service: string
  /** Cancel service path, or undefined if this RPC is not cancellable */
  cancel?: string
  params: ParamDef[]
  returns: ReturnType
  /** JSDoc description for the generated method */
  doc: string
}

/**
 * TypeScript class / type used in the generated SDK API.
 * - AudioFrameRaw / ImageFrameRaw / etc. — re-exported from @luxai-qtrobot/magpie
 * - JointStateFrame / JointCommandFrame / JointTrajectoryFrame — defined in sdk frames/
 * - DictValue  — DictFrame.value → Record<string, unknown>
 * - StringValue — StringFrame.value → string
 * - ListValue   — ListFrame.value → unknown[]
 */
export type FrameClass =
  | 'AudioFrameRaw'
  | 'AudioFrameFlac'
  | 'ImageFrameRaw'
  | 'ImageFrameJpeg'
  | 'JointStateFrame'
  | 'JointCommandFrame'
  | 'JointTrajectoryFrame'
  | 'DictValue'
  | 'StringValue'
  | 'ListValue'

export type StreamEntry = {
  /** Canonical MAGPIE topic path, e.g. '/motor/joints/state/stream:o' */
  topic: string
  /** 'out' = robot→SDK (readable), 'in' = SDK→robot (writable) */
  direction: 'in' | 'out'
  /** TypeScript class used in the generated API */
  frameClass: FrameClass
  /** Default internal queue size for reader */
  queueSize?: number
  /** JSDoc description for the generated method(s) */
  doc: string
}

export type ApiMap = {
  rpc?: Record<string, RpcEntry>
  stream?: Record<string, StreamEntry>
}
