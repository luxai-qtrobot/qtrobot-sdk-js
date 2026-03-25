// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { ActionHandle } from '../actions'
import { TypedStreamReader } from '../streams'

export type GesturePlayOptions = {
  /** Resample trajectory to a uniform rate. */
  resample?: boolean
  /** Resample rate in Hz. */
  rate_hz?: number
  /** Playback speed multiplier. */
  speed_factor?: number
}

export type GestureRecordOptions = {
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
}

export class GestureApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Play a gesture from keyframe data. Blocks until the gesture finishes.
   * @param keyframes Keyframes trajectory dict.
   * @param options Optional parameters.
   * @param timeoutSec RPC timeout in seconds.
   */
  async play(keyframes: Record<string, unknown>, options?: GesturePlayOptions, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/gesture/play', { keyframes, ...options }, timeoutSec)
  }

  /** Play a gesture from keyframe data. Blocks until the gesture finishes. Returns a cancellable handle. */
  playAsync(keyframes: Record<string, unknown>, options?: GesturePlayOptions): ActionHandle<void> {
    const result = this._robot.rpcCall<void>('/gesture/play', { keyframes, ...options })
    const cancel = () => this._robot.rpcCall<void>('/gesture/cancel', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * Play a gesture file by name. Blocks until the gesture finishes.
   * @param gesture Gesture name or path (with or without .xml).
   * @param speed_factor Playback speed multiplier.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async playFile(gesture: string, speed_factor?: number, timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/gesture/file/play', { gesture, speed_factor }, timeoutSec)
  }

  /** Play a gesture file by name. Blocks until the gesture finishes. Returns a cancellable handle. */
  playFileAsync(gesture: string, speed_factor?: number): ActionHandle<boolean> {
    const result = this._robot.rpcCall<boolean>('/gesture/file/play', { gesture, speed_factor })
    const cancel = () => this._robot.rpcCall<void>('/gesture/cancel', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * List available gesture file paths.
   * @param timeoutSec RPC timeout in seconds.
   * @returns unknown[]
   */
  async listFiles(timeoutSec?: number): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/gesture/file/list', {  }, timeoutSec)
  }

  /**
   * Record a gesture trajectory. Blocks until recording is stopped or times out.
   * @param motors Motor names to record.
   * @param options Optional parameters.
   * @param timeoutSec RPC timeout in seconds.
   * @returns Record<string, unknown>
   */
  async record(motors: unknown[], options?: GestureRecordOptions, timeoutSec?: number): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/gesture/record/start', { motors, ...options }, timeoutSec)
  }

  /** Record a gesture trajectory. Blocks until recording is stopped or times out. Returns a cancellable handle. */
  recordAsync(motors: unknown[], options?: GestureRecordOptions): ActionHandle<Record<string, unknown>> {
    const result = this._robot.rpcCall<Record<string, unknown>>('/gesture/record/start', { motors, ...options })
    const cancel = () => this._robot.rpcCall<void>('/gesture/record/stop', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * Stop an in-progress gesture recording. Returns true if recording was active.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async stopRecord(timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/gesture/record/stop', {  }, timeoutSec)
  }

  /**
   * Save the last recorded gesture to a file.
   * @param gesture Name or relative path to save the recorded gesture as XML.
   * @param timeoutSec RPC timeout in seconds.
   */
  async storeRecord(gesture: string, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/gesture/record/store', { gesture }, timeoutSec)
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
   * @param queueSize Internal frame buffer size (default: 2).
   */
  progressReader(queueSize?: number): TypedStreamReader<Record<string, unknown>> {
    return this._robot.getStreamReader<Record<string, unknown>>(
      '/gesture/progress/stream:o',
      raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>),
      queueSize,
    )
  }

}
