// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { ActionHandle } from '../actions'
import { TypedStreamWriter } from '../streams'
import { AudioFrameRaw, Frame, ImageFrameRaw } from '@luxai-qtrobot/magpie'

export type MediaPlayFgVideoFileOptions = {
  /** Playback speed multiplier. */
  speed?: number
  /** Play embedded audio track. */
  with_audio?: boolean
}

export type MediaPlayBgVideoFileOptions = {
  /** Playback speed multiplier. */
  speed?: number
  /** Play embedded audio track. */
  with_audio?: boolean
}

export class MediaApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Play a foreground audio file. Blocks until playback finishes.
   * @param uri Path or URI of the audio file.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async playFgAudioFile(uri: string, timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/media/audio/fg/file/play', { uri }, timeoutSec)
  }

  /** Play a foreground audio file. Blocks until playback finishes. Returns a cancellable handle. */
  playFgAudioFileAsync(uri: string): ActionHandle<boolean> {
    const result = this._robot.rpcCall<boolean>('/media/audio/fg/file/play', { uri })
    const cancel = () => this._robot.rpcCall<void>('/media/audio/fg/file/cancel', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * Pause the foreground audio file currently playing.
   * @param timeoutSec RPC timeout in seconds.
   */
  async pauseFgAudioFile(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/file/pause', {  }, timeoutSec)
  }

  /**
   * Resume the paused foreground audio file.
   * @param timeoutSec RPC timeout in seconds.
   */
  async resumeFgAudioFile(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/file/resume', {  }, timeoutSec)
  }

  /**
   * Cancel the active foreground audio stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async cancelFgAudioStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/stream/cancel', {  }, timeoutSec)
  }

  /**
   * Pause the foreground audio stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async pauseFgAudioStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/stream/pause', {  }, timeoutSec)
  }

  /**
   * Resume the paused foreground audio stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async resumeFgAudioStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/stream/resume', {  }, timeoutSec)
  }

  /**
   * Set the foreground audio playback volume.
   * @param value Volume level in [0.0, 1.0].
   * @param timeoutSec RPC timeout in seconds.
   */
  async setFgAudioVolume(value: number, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/fg/volume/set', { value }, timeoutSec)
  }

  /**
   * Get the current foreground audio playback volume.
   * @param timeoutSec RPC timeout in seconds.
   * @returns number
   */
  async getFgAudioVolume(timeoutSec?: number): Promise<number> {
    return this._robot.rpcCall<number>('/media/audio/fg/volume/get', {  }, timeoutSec)
  }

  /**
   * Play a background audio file. Blocks until playback finishes.
   * @param uri Path or URI of the audio file.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async playBgAudioFile(uri: string, timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/media/audio/bg/file/play', { uri }, timeoutSec)
  }

  /** Play a background audio file. Blocks until playback finishes. Returns a cancellable handle. */
  playBgAudioFileAsync(uri: string): ActionHandle<boolean> {
    const result = this._robot.rpcCall<boolean>('/media/audio/bg/file/play', { uri })
    const cancel = () => this._robot.rpcCall<void>('/media/audio/bg/file/cancel', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * Pause the background audio file currently playing.
   * @param timeoutSec RPC timeout in seconds.
   */
  async pauseBgAudioFile(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/file/pause', {  }, timeoutSec)
  }

  /**
   * Resume the paused background audio file.
   * @param timeoutSec RPC timeout in seconds.
   */
  async resumeBgAudioFile(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/file/resume', {  }, timeoutSec)
  }

  /**
   * Cancel the active background audio stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async cancelBgAudioStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/stream/cancel', {  }, timeoutSec)
  }

  /**
   * Pause the background audio stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async pauseBgAudioStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/stream/pause', {  }, timeoutSec)
  }

  /**
   * Resume the paused background audio stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async resumeBgAudioStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/stream/resume', {  }, timeoutSec)
  }

  /**
   * Set the background audio playback volume.
   * @param value Volume level in [0.0, 1.0].
   * @param timeoutSec RPC timeout in seconds.
   */
  async setBgAudioVolume(value: number, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/audio/bg/volume/set', { value }, timeoutSec)
  }

  /**
   * Get the current background audio playback volume.
   * @param timeoutSec RPC timeout in seconds.
   * @returns number
   */
  async getBgAudioVolume(timeoutSec?: number): Promise<number> {
    return this._robot.rpcCall<number>('/media/audio/bg/volume/get', {  }, timeoutSec)
  }

  /**
   * Play a foreground video file. Blocks until playback finishes.
   * @param uri Path or URI of the video file.
   * @param options Optional parameters.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async playFgVideoFile(uri: string, options?: MediaPlayFgVideoFileOptions, timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/media/video/fg/file/play', { uri, ...options }, timeoutSec)
  }

  /** Play a foreground video file. Blocks until playback finishes. Returns a cancellable handle. */
  playFgVideoFileAsync(uri: string, options?: MediaPlayFgVideoFileOptions): ActionHandle<boolean> {
    const result = this._robot.rpcCall<boolean>('/media/video/fg/file/play', { uri, ...options })
    const cancel = () => this._robot.rpcCall<void>('/media/video/fg/file/cancel', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * Pause the foreground video file currently playing.
   * @param timeoutSec RPC timeout in seconds.
   */
  async pauseFgVideoFile(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/file/pause', {  }, timeoutSec)
  }

  /**
   * Resume the paused foreground video file.
   * @param timeoutSec RPC timeout in seconds.
   */
  async resumeFgVideoFile(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/file/resume', {  }, timeoutSec)
  }

  /**
   * Cancel the active foreground video stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async cancelFgVideoStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/stream/cancel', {  }, timeoutSec)
  }

  /**
   * Pause the foreground video stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async pauseFgVideoStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/stream/pause', {  }, timeoutSec)
  }

  /**
   * Resume the paused foreground video stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async resumeFgVideoStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/stream/resume', {  }, timeoutSec)
  }

  /**
   * Set the foreground video layer transparency.
   * @param value Alpha transparency in [0.0, 1.0].
   * @param timeoutSec RPC timeout in seconds.
   */
  async setFgVideoAlpha(value: number, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/fg/set_alpha', { value }, timeoutSec)
  }

  /**
   * Play a background video file. Blocks until playback finishes.
   * @param uri Path or URI of the video file.
   * @param options Optional parameters.
   * @param timeoutSec RPC timeout in seconds.
   * @returns boolean
   */
  async playBgVideoFile(uri: string, options?: MediaPlayBgVideoFileOptions, timeoutSec?: number): Promise<boolean> {
    return this._robot.rpcCall<boolean>('/media/video/bg/file/play', { uri, ...options }, timeoutSec)
  }

  /** Play a background video file. Blocks until playback finishes. Returns a cancellable handle. */
  playBgVideoFileAsync(uri: string, options?: MediaPlayBgVideoFileOptions): ActionHandle<boolean> {
    const result = this._robot.rpcCall<boolean>('/media/video/bg/file/play', { uri, ...options })
    const cancel = () => this._robot.rpcCall<void>('/media/video/bg/file/cancel', {})
    return new ActionHandle(result, cancel)
  }

  /**
   * Pause the background video file currently playing.
   * @param timeoutSec RPC timeout in seconds.
   */
  async pauseBgVideoFile(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/file/pause', {  }, timeoutSec)
  }

  /**
   * Resume the paused background video file.
   * @param timeoutSec RPC timeout in seconds.
   */
  async resumeBgVideoFile(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/file/resume', {  }, timeoutSec)
  }

  /**
   * Cancel the active background video stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async cancelBgVideoStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/stream/cancel', {  }, timeoutSec)
  }

  /**
   * Pause the background video stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async pauseBgVideoStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/stream/pause', {  }, timeoutSec)
  }

  /**
   * Resume the paused background video stream.
   * @param timeoutSec RPC timeout in seconds.
   */
  async resumeBgVideoStream(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/media/video/bg/stream/resume', {  }, timeoutSec)
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
