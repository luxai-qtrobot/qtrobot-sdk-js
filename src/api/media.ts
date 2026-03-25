// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { withSignal } from '../actions'
import { TypedStreamWriter } from '../streams'
import { AudioFrameRaw, Frame, ImageFrameRaw } from '@luxai-qtrobot/magpie'

export type MediaPlayFgAudioFileOptions = {
  /** Path or URI of the audio file. */
  uri: string
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type MediaSetFgAudioVolumeOptions = {
  /** Volume level in [0.0, 1.0]. */
  value: number
}

export type MediaPlayBgAudioFileOptions = {
  /** Path or URI of the audio file. */
  uri: string
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type MediaSetBgAudioVolumeOptions = {
  /** Volume level in [0.0, 1.0]. */
  value: number
}

export type MediaPlayFgVideoFileOptions = {
  /** Path or URI of the video file. */
  uri: string
  /** Playback speed multiplier. */
  speed?: number
  /** Play embedded audio track. */
  with_audio?: boolean
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export type MediaSetFgVideoAlphaOptions = {
  /** Alpha transparency in [0.0, 1.0]. */
  value: number
}

export type MediaPlayBgVideoFileOptions = {
  /** Path or URI of the video file. */
  uri: string
  /** Playback speed multiplier. */
  speed?: number
  /** Play embedded audio track. */
  with_audio?: boolean
  /** AbortSignal to cancel the operation. */
  signal?: AbortSignal
}

export class MediaApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Play a foreground audio file. Blocks until playback finishes.
   * @param options.uri Path or URI of the audio file.
   * @param options.signal AbortSignal to cancel the operation.
   * @returns boolean
   */
  async playFgAudioFile(options: MediaPlayFgAudioFileOptions): Promise<boolean> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<boolean>('/media/audio/fg/file/play', args as Record<string, unknown>)
    if (!signal) return rpc
    return withSignal(rpc, signal, () => this._robot.rpcCall<void>('/media/audio/fg/file/cancel', {}))
  }

  /**
   * Pause the foreground audio file currently playing.
   */
  async pauseFgAudioFile(): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/file/pause', {})
  }

  /**
   * Resume the paused foreground audio file.
   */
  async resumeFgAudioFile(): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/file/resume', {})
  }

  /**
   * Cancel the active foreground audio stream.
   */
  async cancelFgAudioStream(): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/stream/cancel', {})
  }

  /**
   * Pause the foreground audio stream.
   */
  async pauseFgAudioStream(): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/stream/pause', {})
  }

  /**
   * Resume the paused foreground audio stream.
   */
  async resumeFgAudioStream(): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/stream/resume', {})
  }

  /**
   * Set the foreground audio playback volume.
   * @param options.value Volume level in [0.0, 1.0].
   */
  async setFgAudioVolume(options: MediaSetFgAudioVolumeOptions): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/volume/set', options as Record<string, unknown>)
  }

  /**
   * Get the current foreground audio playback volume.
   * @returns number
   */
  async getFgAudioVolume(): Promise<number> {
    return this._robot.rpcCall<number>('/media/audio/fg/volume/get', {})
  }

  /**
   * Play a background audio file. Blocks until playback finishes.
   * @param options.uri Path or URI of the audio file.
   * @param options.signal AbortSignal to cancel the operation.
   * @returns boolean
   */
  async playBgAudioFile(options: MediaPlayBgAudioFileOptions): Promise<boolean> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<boolean>('/media/audio/bg/file/play', args as Record<string, unknown>)
    if (!signal) return rpc
    return withSignal(rpc, signal, () => this._robot.rpcCall<void>('/media/audio/bg/file/cancel', {}))
  }

  /**
   * Pause the background audio file currently playing.
   */
  async pauseBgAudioFile(): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/file/pause', {})
  }

  /**
   * Resume the paused background audio file.
   */
  async resumeBgAudioFile(): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/file/resume', {})
  }

  /**
   * Cancel the active background audio stream.
   */
  async cancelBgAudioStream(): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/stream/cancel', {})
  }

  /**
   * Pause the background audio stream.
   */
  async pauseBgAudioStream(): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/stream/pause', {})
  }

  /**
   * Resume the paused background audio stream.
   */
  async resumeBgAudioStream(): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/stream/resume', {})
  }

  /**
   * Set the background audio playback volume.
   * @param options.value Volume level in [0.0, 1.0].
   */
  async setBgAudioVolume(options: MediaSetBgAudioVolumeOptions): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/volume/set', options as Record<string, unknown>)
  }

  /**
   * Get the current background audio playback volume.
   * @returns number
   */
  async getBgAudioVolume(): Promise<number> {
    return this._robot.rpcCall<number>('/media/audio/bg/volume/get', {})
  }

  /**
   * Play a foreground video file. Blocks until playback finishes.
   * @param options.uri Path or URI of the video file.
   * @param options.speed Playback speed multiplier.
   * @param options.with_audio Play embedded audio track.
   * @param options.signal AbortSignal to cancel the operation.
   * @returns boolean
   */
  async playFgVideoFile(options: MediaPlayFgVideoFileOptions): Promise<boolean> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<boolean>('/media/video/fg/file/play', args as Record<string, unknown>)
    if (!signal) return rpc
    return withSignal(rpc, signal, () => this._robot.rpcCall<void>('/media/video/fg/file/cancel', {}))
  }

  /**
   * Pause the foreground video file currently playing.
   */
  async pauseFgVideoFile(): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/file/pause', {})
  }

  /**
   * Resume the paused foreground video file.
   */
  async resumeFgVideoFile(): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/file/resume', {})
  }

  /**
   * Cancel the active foreground video stream.
   */
  async cancelFgVideoStream(): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/stream/cancel', {})
  }

  /**
   * Pause the foreground video stream.
   */
  async pauseFgVideoStream(): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/stream/pause', {})
  }

  /**
   * Resume the paused foreground video stream.
   */
  async resumeFgVideoStream(): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/stream/resume', {})
  }

  /**
   * Set the foreground video layer transparency.
   * @param options.value Alpha transparency in [0.0, 1.0].
   */
  async setFgVideoAlpha(options: MediaSetFgVideoAlphaOptions): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/set_alpha', options as Record<string, unknown>)
  }

  /**
   * Play a background video file. Blocks until playback finishes.
   * @param options.uri Path or URI of the video file.
   * @param options.speed Playback speed multiplier.
   * @param options.with_audio Play embedded audio track.
   * @param options.signal AbortSignal to cancel the operation.
   * @returns boolean
   */
  async playBgVideoFile(options: MediaPlayBgVideoFileOptions): Promise<boolean> {
    const { signal, ...args } = options
    const rpc = this._robot.rpcCall<boolean>('/media/video/bg/file/play', args as Record<string, unknown>)
    if (!signal) return rpc
    return withSignal(rpc, signal, () => this._robot.rpcCall<void>('/media/video/bg/file/cancel', {}))
  }

  /**
   * Pause the background video file currently playing.
   */
  async pauseBgVideoFile(): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/file/pause', {})
  }

  /**
   * Resume the paused background video file.
   */
  async resumeBgVideoFile(): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/file/resume', {})
  }

  /**
   * Cancel the active background video stream.
   */
  async cancelBgVideoStream(): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/stream/cancel', {})
  }

  /**
   * Pause the background video stream.
   */
  async pauseBgVideoStream(): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/stream/pause', {})
  }

  /**
   * Resume the paused background video stream.
   */
  async resumeBgVideoStream(): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/stream/resume', {})
  }

  /**
   * Inbound foreground audio stream — push AudioFrameRaw frames to play audio on the robot.
   * @returns Stream writer. Call `writer.write(frame)` to send frames.
   */
  openFgAudioStreamWriter(): TypedStreamWriter<AudioFrameRaw> {
    return this._robot.getStreamWriter<AudioFrameRaw>(
      '/media/audio/fg/stream:i',
      f => f.toDict(),
    )
  }

  /**
   * Inbound background audio stream — push AudioFrameRaw frames to play audio on the robot.
   * @returns Stream writer. Call `writer.write(frame)` to send frames.
   */
  openBgAudioStreamWriter(): TypedStreamWriter<AudioFrameRaw> {
    return this._robot.getStreamWriter<AudioFrameRaw>(
      '/media/audio/bg/stream:i',
      f => f.toDict(),
    )
  }

  /**
   * Inbound foreground video stream — push ImageFrameRaw frames to display video on the robot.
   * @returns Stream writer. Call `writer.write(frame)` to send frames.
   */
  openFgVideoStreamWriter(): TypedStreamWriter<ImageFrameRaw> {
    return this._robot.getStreamWriter<ImageFrameRaw>(
      '/media/video/fg/stream:i',
      f => f.toDict(),
    )
  }

  /**
   * Inbound background video stream — push ImageFrameRaw frames to display video on the robot.
   * @returns Stream writer. Call `writer.write(frame)` to send frames.
   */
  openBgVideoStreamWriter(): TypedStreamWriter<ImageFrameRaw> {
    return this._robot.getStreamWriter<ImageFrameRaw>(
      '/media/video/bg/stream:i',
      f => f.toDict(),
    )
  }

}
