// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { withSignal } from '../actions'

export type TtsSayTextOptions = {
  /** Plain text to synthesize. */
  text: string
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
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type TtsSaySsmlOptions = {
  /** SSML markup string. */
  ssml: string
  /** Engine id (uses default if omitted). */
  engine?: string
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type TtsSetDefaultEngineOptions = {
  /** Engine id, e.g. "acapela" or "azure". */
  engine: string
}

export type TtsSetConfigOptions = {
  /** Engine-specific config key/value pairs. */
  config: Record<string, unknown>
  /** Engine id (uses default if omitted). */
  engine?: string
}

export type TtsGetConfigOptions = {
  /** Engine id (uses default if omitted). */
  engine?: string
}

export type TtsGetLanguagesOptions = {
  /** Engine id (uses default if omitted). */
  engine?: string
}

export type TtsGetVoicesOptions = {
  /** Engine id (uses default if omitted). */
  engine?: string
}

export type TtsSupportsSsmlOptions = {
  /** Engine id (uses default if omitted). */
  engine?: string
}

export class TtsApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Speak plain text. Blocks until audio playback completes.
   * @param options.text Plain text to synthesize.
   * @param options.engine Engine id (uses default if omitted).
   * @param options.lang Language code, e.g. "en-US".
   * @param options.voice Voice id or name.
   * @param options.rate Speech rate multiplier.
   * @param options.pitch Pitch adjustment.
   * @param options.volume Volume level.
   * @param options.style Speaking style (engine-dependent).
   * @param options.signal AbortSignal to cancel the operation.
   */
  async sayText(options: TtsSayTextOptions): Promise<void> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<void>('/tts/engine/say/text', args as Record<string, unknown>)
    if (!signal) { await rpc; return }
    await withSignal(rpc, signal, () => this._robot.rpcCall<void>('/tts/engine/cancel', {}))
  }

  /**
   * Speak SSML markup. Blocks until audio playback completes.
   * @param options.ssml SSML markup string.
   * @param options.engine Engine id (uses default if omitted).
   * @param options.signal AbortSignal to cancel the operation.
   */
  async saySsml(options: TtsSaySsmlOptions): Promise<void> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<void>('/tts/engine/say/ssml', args as Record<string, unknown>)
    if (!signal) { await rpc; return }
    await withSignal(rpc, signal, () => this._robot.rpcCall<void>('/tts/engine/cancel', {}))
  }

  /**
   * Set the default TTS engine.
   * @param options.engine Engine id, e.g. "acapela" or "azure".
   */
  async setDefaultEngine(options: TtsSetDefaultEngineOptions): Promise<void> {
    await this._robot.rpcCall('/tts/default_engine/set', options as Record<string, unknown>)
  }

  /**
   * Get the current default TTS engine id.
   * @returns string
   */
  async getDefaultEngine(): Promise<string> {
    return this._robot.rpcCall<string>('/tts/default_engine/get', {})
  }

  /**
   * List available TTS engine ids.
   * @returns unknown[]
   */
  async listEngines(): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/tts/engines/list', {})
  }

  /**
   * Set engine configuration.
   * @param options.config Engine-specific config key/value pairs.
   * @param options.engine Engine id (uses default if omitted).
   */
  async setConfig(options: TtsSetConfigOptions): Promise<void> {
    await this._robot.rpcCall('/tts/engine/configure/set', options as Record<string, unknown>)
  }

  /**
   * Get current engine configuration.
   * @param options.engine Engine id (uses default if omitted).
   * @returns Record<string, unknown>
   */
  async getConfig(options: TtsGetConfigOptions): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/tts/engine/configure/get', options as Record<string, unknown>)
  }

  /**
   * Get supported language codes for an engine.
   * @param options.engine Engine id (uses default if omitted).
   * @returns unknown[]
   */
  async getLanguages(options: TtsGetLanguagesOptions): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/tts/engine/languages/get', options as Record<string, unknown>)
  }

  /**
   * Get available voices for an engine.
   * @param options.engine Engine id (uses default if omitted).
   * @returns unknown[]
   */
  async getVoices(options: TtsGetVoicesOptions): Promise<unknown[]> {
    return this._robot.rpcCall<unknown[]>('/tts/engine/voices/get', options as Record<string, unknown>)
  }

  /**
   * Check whether an engine supports SSML.
   * @param options.engine Engine id (uses default if omitted).
   * @returns boolean
   */
  async supportsSsml(options: TtsSupportsSsmlOptions): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/tts/engine/supports/ssml', options as Record<string, unknown>)
  }

}
