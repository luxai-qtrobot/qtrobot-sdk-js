// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { ActionHandle } from '../actions'

export class FaceApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Show an emotion animation on the robot face. Blocks until the animation finishes.
   * @param emotion Emotion name or relative path (with or without .avi).
   * @param speed Playback speed factor (uses config default if omitted).
   * @param timeoutSec RPC timeout in seconds.
   */
  async showEmotion(emotion: string, speed?: number, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/face/emotion/show', { emotion, speed }, timeoutSec)
  }

  /** Show an emotion animation on the robot face. Blocks until the animation finishes. Returns a cancellable handle. */
  showEmotionAsync(emotion: string, speed?: number): ActionHandle<void> {
    const result = this._robot.rpcCall<void>('/face/emotion/show', { emotion, speed })
    const cancel = () => this._robot.rpcCall<void>('/face/emotion/stop', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * List available emotion animation paths.
   * @param timeoutSec RPC timeout in seconds.
   * @returns unknown[]
   */
  async listEmotions(timeoutSec?: number): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/face/emotion/list', {  }, timeoutSec)
  }

  /**
   * Move the robot eyes.
   * @param l_eye [dx, dy] pixel offset from centre for the left eye.
   * @param r_eye [dx, dy] pixel offset from centre for the right eye.
   * @param duration If > 0, eyes reset to centre after this many seconds.
   * @param timeoutSec RPC timeout in seconds.
   */
  async look(l_eye: unknown[], r_eye: unknown[], duration?: number, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/face/look', { l_eye, r_eye, duration }, timeoutSec)
  }

}
