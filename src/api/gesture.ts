// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { withSignal } from '../actions'
import { TypedStreamReader } from '../streams'

export type GesturePlayOptions = {
  /** Keyframes trajectory dict. */
  keyframes: Record<string, unknown>
  /** Resample trajectory to a uniform rate. */
  resample?: boolean
  /** Resample rate in Hz. */
  rate_hz?: number
  /** Playback speed multiplier. */
  speed_factor?: number
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type GesturePlayFileOptions = {
  /** Gesture name or path (with or without .xml). */
  gesture: string
  /** Playback speed multiplier. */
  speed_factor?: number
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type GestureRecordOptions = {
  /** Motor names to record. */
  motors: unknown[]
  /** Disable motor torque during recording. */
  release_motors?: boolean
  /** Delay before recording starts (ms). */
  delay_start_ms?: number
  /** Maximum recording duration (ms). */
  timeout_ms?: number
  /** Remove redundant keyframes after recording. */
  refine_keyframe?: boolean
  /** Position epsilon for keyframe refinement (degrees). */
  keyframe_pos_eps?: number
  /** Maximum gap between keyframes (microseconds). */
  keyframe_max_gap_us?: number
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type GestureStoreRecordOptions = {
  /** Name or relative path to save the recorded gesture as XML. */
  gesture: string
}

export class GestureApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Play a gesture from keyframe data. Blocks until the gesture finishes.
   * @param options.keyframes Keyframes trajectory dict.
   * @param options.resample Resample trajectory to a uniform rate.
   * @param options.rate_hz Resample rate in Hz.
   * @param options.speed_factor Playback speed multiplier.
   * @param options.signal AbortSignal to cancel the operation.
   */
  async play(options: GesturePlayOptions): Promise<void> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<void>('/gesture/play', args as Record<string, unknown>)
    if (!signal) { await rpc; return }
    await withSignal(rpc, signal, () => this._robot.rpcCall<void>('/gesture/cancel', {}))
  }

  /**
   * Play a gesture file by name. Blocks until the gesture finishes.
   * @param options.gesture Gesture name or path (with or without .xml).
   * @param options.speed_factor Playback speed multiplier.
   * @param options.signal AbortSignal to cancel the operation.
   * @returns boolean
   */
  async playFile(options: GesturePlayFileOptions): Promise<boolean> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<boolean>('/gesture/file/play', args as Record<string, unknown>)
    if (!signal) return rpc
    return withSignal(rpc, signal, () => this._robot.rpcCall<void>('/gesture/cancel', {}))
  }

  /**
   * List available gesture file paths.
   * @returns unknown[]
   */
  async listFiles(): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/gesture/file/list', {})
  }

  /**
   * Record a gesture trajectory. Blocks until recording is stopped or times out.
   * @param options.motors Motor names to record.
   * @param options.release_motors Disable motor torque during recording.
   * @param options.delay_start_ms Delay before recording starts (ms).
   * @param options.timeout_ms Maximum recording duration (ms).
   * @param options.refine_keyframe Remove redundant keyframes after recording.
   * @param options.keyframe_pos_eps Position epsilon for keyframe refinement (degrees).
   * @param options.keyframe_max_gap_us Maximum gap between keyframes (microseconds).
   * @param options.signal AbortSignal to cancel the operation.
   * @returns Record<string, unknown>
   */
  async record(options: GestureRecordOptions): Promise<Record<string, unknown>> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<Record<string, unknown>>('/gesture/record/start', args as Record<string, unknown>)
    if (!signal) return rpc
    return withSignal(rpc, signal, () => this._robot.rpcCall<void>('/gesture/record/stop', {}))
  }

  /**
   * Stop an in-progress gesture recording. Returns true if recording was active.
   * @returns boolean
   */
  async stopRecord(): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/gesture/record/stop', {})
  }

  /**
   * Save the last recorded gesture to a file.
   * @param options.gesture Name or relative path to save the recorded gesture as XML.
   */
  async storeRecord(options: GestureStoreRecordOptions): Promise<void> {
    await this._robot.rpcCall('/gesture/record/store', options as Record<string, unknown>)
  }

  /**
   * Outbound gesture playback progress events.
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onProgress(handler: (frame: Record<string, unknown>) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<Record<string, unknown>>(
      '/gesture/progress/stream:o',
      raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>),
    ).onFrame(handler, onError)
  }

  /**
   * Outbound gesture playback progress events.
   *
   * @example
   * for await (const frame of robot.gesture.progressReader()) {
   *   // handle frame
   * }
   * @param options.queueSize Internal frame buffer size (default: 2).
   */
  progressReader(options?: { queueSize?: number }): TypedStreamReader<Record<string, unknown>> {
    return this._robot.getStreamReader<Record<string, unknown>>(
      '/gesture/progress/stream:o',
      raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>),
      options?.queueSize,
    )
  }

}
