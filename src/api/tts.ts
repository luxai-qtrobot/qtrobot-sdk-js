// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { ActionHandle } from '../actions'

export type TtsSayTextOptions = {
  /** Engine id (uses default if omitted). */
  engine?: string
  /** Language code, e.g. "en-US". */
  lang?: string
  /** Voice id or name. */
  voice?: string
  /** Speech rate multiplier. */
  rate?: number
  /** Pitch adjustment. */
  pitch?: number
  /** Volume level. */
  volume?: number
  /** Speaking style (engine-dependent). */
  style?: string
}

export class TtsApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Speak plain text. Blocks until audio playback completes.
   * @param text Plain text to synthesize.
   * @param options Optional parameters.
   * @param timeoutSec RPC timeout in seconds.
   */
  async sayText(text: string, options?: TtsSayTextOptions, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/tts/engine/say/text', { text, ...options }, timeoutSec)
  }

  /** Speak plain text. Blocks until audio playback completes. Returns a cancellable handle. */
  sayTextAsync(text: string, options?: TtsSayTextOptions): ActionHandle<void> {
    const result = this._robot.rpcCall<void>('/tts/engine/say/text', { text, ...options })
    const cancel = () => this._robot.rpcCall<void>('/tts/engine/cancel', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * Speak SSML markup. Blocks until audio playback completes.
   * @param ssml SSML markup string.
   * @param engine Engine id (uses default if omitted).
   * @param timeoutSec RPC timeout in seconds.
   */
  async saySsml(ssml: string, engine?: string, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/tts/engine/say/ssml', { ssml, engine }, timeoutSec)
  }

  /** Speak SSML markup. Blocks until audio playback completes. Returns a cancellable handle. */
  saySsmlAsync(ssml: string, engine?: string): ActionHandle<void> {
    const result = this._robot.rpcCall<void>('/tts/engine/say/ssml', { ssml, engine })
    const cancel = () => this._robot.rpcCall<void>('/tts/engine/cancel', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * Set the default TTS engine.
   * @param engine Engine id, e.g. "acapela" or "azure".
   * @param timeoutSec RPC timeout in seconds.
   */
  async setDefaultEngine(engine: string, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/tts/default_engine/set', { engine }, timeoutSec)
  }

  /**
   * Get the current default TTS engine id.
   * @param timeoutSec RPC timeout in seconds.
   * @returns string
   */
  async getDefaultEngine(timeoutSec?: number): Promise<string> {
    return this._robot.rpcCall<string>('/tts/default_engine/get', {  }, timeoutSec)
  }

  /**
   * List available TTS engine ids.
   * @param timeoutSec RPC timeout in seconds.
   * @returns unknown[]
   */
  async listEngines(timeoutSec?: number): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/tts/engines/list', {  }, timeoutSec)
  }

  /**
   * Set engine configuration.
   * @param config Engine-specific config key/value pairs.
   * @param engine Engine id (uses default if omitted).
   * @param timeoutSec RPC timeout in seconds.
   */
  async setConfig(config: Record<string, unknown>, engine?: string, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/tts/engine/configure/set', { config, engine }, timeoutSec)
  }

  /**
   * Get current engine configuration.
   * @param engine Engine id (uses default if omitted).
   * @param timeoutSec RPC timeout in seconds.
   * @returns Record<string, unknown>
   */
  async getConfig(engine?: string, timeoutSec?: number): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/tts/engine/configure/get', { engine }, timeoutSec)
  }

  /**
   * Get supported language codes for an engine.
   * @param engine Engine id (uses default if omitted).
   * @param timeoutSec RPC timeout in seconds.
   * @returns unknown[]
   */
  async getLanguages(engine?: string, timeoutSec?: number): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/tts/engine/languages/get', { engine }, timeoutSec)
  }

  /**
   * Get available voices for an engine.
   * @param engine Engine id (uses default if omitted).
   * @param timeoutSec RPC timeout in seconds.
   * @returns unknown[]
   */
  async getVoices(engine?: string, timeoutSec?: number): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/tts/engine/voices/get', { engine }, timeoutSec)
  }

  /**
   * Check whether an engine supports SSML.
   * @param engine Engine id (uses default if omitted).
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async supportsSsml(engine?: string, timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/tts/engine/supports/ssml', { engine }, timeoutSec)
  }

}
