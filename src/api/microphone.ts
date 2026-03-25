// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { TypedStreamReader } from '../streams'
import { AudioFrameRaw, Frame } from '@luxai-qtrobot/magpie'

export class MicrophoneApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Get all internal microphone tuning parameters (e.g. AECNORM, VOICEACTIVITY).
   * @param timeoutSec RPC timeout in seconds.
   * @returns Record<string, unknown>
   */
  async getIntTuning(timeoutSec?: number): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/microphone/int/tunning/get', {  }, timeoutSec)
  }

  /**
   * Set a single internal microphone tuning parameter.
   * @param name Respeaker parameter name, e.g. "AECNORM".
   * @param value Numeric value to set.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async setIntTuning(name: string, value: number, timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/microphone/int/tunning/set', { name, value }, timeoutSec)
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 0.
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onIntAudioCh0(handler: (frame: AudioFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch0/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 0.
   *
   * @example
   * for await (const frame of robot.microphone.intAudioCh0Reader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 10).
   */
  intAudioCh0Reader(queueSize?: number): TypedStreamReader<AudioFrameRaw> {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch0/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 1.
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onIntAudioCh1(handler: (frame: AudioFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch1/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 1.
   *
   * @example
   * for await (const frame of robot.microphone.intAudioCh1Reader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 10).
   */
  intAudioCh1Reader(queueSize?: number): TypedStreamReader<AudioFrameRaw> {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch1/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 2.
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onIntAudioCh2(handler: (frame: AudioFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch2/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 2.
   *
   * @example
   * for await (const frame of robot.microphone.intAudioCh2Reader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 10).
   */
  intAudioCh2Reader(queueSize?: number): TypedStreamReader<AudioFrameRaw> {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch2/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 3.
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onIntAudioCh3(handler: (frame: AudioFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch3/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 3.
   *
   * @example
   * for await (const frame of robot.microphone.intAudioCh3Reader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 10).
   */
  intAudioCh3Reader(queueSize?: number): TypedStreamReader<AudioFrameRaw> {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch3/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 4.
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onIntAudioCh4(handler: (frame: AudioFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch4/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound raw PCM audio from internal microphone channel 4.
   *
   * @example
   * for await (const frame of robot.microphone.intAudioCh4Reader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 10).
   */
  intAudioCh4Reader(queueSize?: number): TypedStreamReader<AudioFrameRaw> {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/int/audio/ch4/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound voice-activity and direction events from the internal microphone array.
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onIntEvent(handler: (frame: Record<string, unknown>) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<Record<string, unknown>>(
      '/mic/int/event/stream:o',
      raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>),
    ).onFrame(handler, onError)
  }

  /**
   * Outbound voice-activity and direction events from the internal microphone array.
   *
   * @example
   * for await (const frame of robot.microphone.intEventReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  intEventReader(queueSize?: number): TypedStreamReader<Record<string, unknown>> {
    return this._robot.getStreamReader<Record<string, unknown>>(
      '/mic/int/event/stream:o',
      raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>),
      queueSize,
    )
  }

  /**
   * Outbound raw PCM audio from external microphone channel 0.
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onExtAudioCh0(handler: (frame: AudioFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/ext/audio/ch0/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound raw PCM audio from external microphone channel 0.
   *
   * @example
   * for await (const frame of robot.microphone.extAudioCh0Reader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 10).
   */
  extAudioCh0Reader(queueSize?: number): TypedStreamReader<AudioFrameRaw> {
    return this._robot.getStreamReader<AudioFrameRaw>(
      '/mic/ext/audio/ch0/stream:o',
      raw => Frame.fromDict(raw as Record<string, unknown>) as AudioFrameRaw,
      queueSize,
    )
  }

}
