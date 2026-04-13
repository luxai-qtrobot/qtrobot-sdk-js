import type { Robot } from '../client'
import { WebRtcTransport, UnsupportedApiError } from '../transport'

export class ExtraApi {
  /**
   * @param _robot          The Robot instance (used to fall back to the robot's own transport).
   * @param _pluginTransport When set, this transport is used instead of the robot's own transport.
   *                         Pass the plugin's WebRtcTransport when attaching to a plugin API (e.g. CameraApi).
   */
  constructor(
    private readonly _robot: Robot,
    private readonly _pluginTransport?: WebRtcTransport,
  ) {}

  /**
   * Return the remote audio MediaStreamTrack received over WebRTC.
   *
   * Only available when connected via `Robot.connectWebrtcMqtt` with
   * `use_media_channels=true` (the robot gateway default) AND the gateway
   * config includes an audio stream.
   *
   * Attach the track to an `<audio>` element:
   * ```js
   * const track = await robot.extra.getAudioTrack()
   * const audio = new Audio()
   * audio.srcObject = new MediaStream([track])
   * audio.play()
   * ```
   *
   * @throws {UnsupportedApiError} when not on a WebRTC transport or no audio track is available.
   */
  async getAudioTrack(): Promise<MediaStreamTrack> {
    const conn = this._webRtcConnection()
    if (!conn.useMediaChannels) {
      throw new UnsupportedApiError(
        'getAudioTrack() requires use_media_channels=true on the robot gateway.'
      )
    }
    return new Promise<MediaStreamTrack>((resolve) => {
      const cb = (track: MediaStreamTrack | Record<string, unknown>) => {
        conn.removeAudioCallback(cb)
        resolve(track as MediaStreamTrack)
      }
      conn.addAudioCallback(cb)
      // addAudioCallback replays immediately if track already arrived
    })
  }

  /**
   * Return the remote video MediaStreamTrack received over WebRTC.
   *
   * Only available when connected via `Robot.connectWebrtcMqtt` with
   * `use_media_channels=true` (the robot gateway default) AND the gateway
   * config includes a video stream (e.g. camera plugin).
   *
   * Attach the track to a `<video>` element:
   * ```js
   * const track = await robot.extra.getVideoTrack()
   * videoEl.srcObject = new MediaStream([track])
   * videoEl.play()
   * ```
   *
   * @throws {UnsupportedApiError} when not on a WebRTC transport or no video track is available.
   */
  async getVideoTrack(): Promise<MediaStreamTrack> {
    const conn = this._webRtcConnection()
    if (!conn.useMediaChannels) {
      throw new UnsupportedApiError(
        'getVideoTrack() requires use_media_channels=true on the robot gateway.'
      )
    }
    return new Promise<MediaStreamTrack>((resolve) => {
      const cb = (track: MediaStreamTrack | Record<string, unknown>) => {
        conn.removeVideoCallback(cb)
        resolve(track as MediaStreamTrack)
      }
      conn.addVideoCallback(cb)
      // addVideoCallback replays immediately if track already arrived
    })
  }

  private _webRtcConnection() {
    const transport: unknown = this._pluginTransport
      ?? (this._robot as unknown as { _transport: unknown })._transport
    if (!(transport instanceof WebRtcTransport)) {
      throw new UnsupportedApiError(
        'getAudioTrack() / getVideoTrack() require a WebRTC connection.'
      )
    }
    return transport.connection
  }
}
