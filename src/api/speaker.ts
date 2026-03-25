// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'

export class SpeakerApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Set the master speaker volume.
   * @param value Master speaker volume in [0.0, 1.0].
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async setVolume(value: number, timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/speaker/volume/set', { value }, timeoutSec)
  }

  /**
   * Get the current master speaker volume.
   * @param timeoutSec RPC timeout in seconds.
   * @returns number
   */
  async getVolume(timeoutSec?: number): Promise<number> {
    return this._robot.rpcCall<number>('/speaker/volume/get', {  }, timeoutSec)
  }

  /**
   * Mute the speaker.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async mute(timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/speaker/volume/mute', {  }, timeoutSec)
  }

  /**
   * Unmute the speaker.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async unmute(timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/speaker/volume/unmute', {  }, timeoutSec)
  }

}
