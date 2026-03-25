// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'

export type SpeakerSetVolumeOptions = {
  /** Master speaker volume in [0.0, 1.0]. */
  value: number
}

export class SpeakerApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Set the master speaker volume.
   * @param options.value Master speaker volume in [0.0, 1.0].
   * @returns boolean
   */
  async setVolume(options: SpeakerSetVolumeOptions): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/speaker/volume/set', options as Record<string, unknown>)
  }

  /**
   * Get the current master speaker volume.
   * @returns number
   */
  async getVolume(): Promise<number> {
    return this._robot.rpcCall<number>('/speaker/volume/get', {})
  }

  /**
   * Mute the speaker.
   * @returns boolean
   */
  async mute(): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/speaker/volume/mute', {})
  }

  /**
   * Unmute the speaker.
   * @returns boolean
   */
  async unmute(): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/speaker/volume/unmute', {})
  }

}
