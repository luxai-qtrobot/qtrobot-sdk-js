// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { withSignal } from '../actions'

export type FaceShowEmotionOptions = {
  /** Emotion name or relative path (with or without .avi). */
  emotion: string
  /** Playback speed factor (uses config default if omitted). */
  speed?: number
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type FaceLookOptions = {
  /** [dx, dy] pixel offset from centre for the left eye. */
  l_eye: unknown[]
  /** [dx, dy] pixel offset from centre for the right eye. */
  r_eye: unknown[]
  /** If > 0, eyes reset to centre after this many seconds. */
  duration?: number
}

export class FaceApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Show an emotion animation on the robot face. Blocks until the animation finishes.
   * @param options.emotion Emotion name or relative path (with or without .avi).
   * @param options.speed Playback speed factor (uses config default if omitted).
   * @param options.signal AbortSignal to cancel the operation.
   */
  async showEmotion(options: FaceShowEmotionOptions): Promise<void> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<void>('/face/emotion/show', args as Record<string, unknown>)
    if (!signal) { await rpc; return }
    await withSignal(rpc, signal, () => this._robot.rpcCall<void>('/face/emotion/stop', {}))
  }

  /**
   * List available emotion animation paths.
   * @returns unknown[]
   */
  async listEmotions(): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/face/emotion/list', {})
  }

  /**
   * Move the robot eyes.
   * @param options.l_eye [dx, dy] pixel offset from centre for the left eye.
   * @param options.r_eye [dx, dy] pixel offset from centre for the right eye.
   * @param options.duration If > 0, eyes reset to centre after this many seconds.
   */
  async look(options: FaceLookOptions): Promise<void> {
    await this._robot.rpcCall('/face/look', options as Record<string, unknown>)
  }

}
