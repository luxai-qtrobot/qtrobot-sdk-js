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
   * Return a Promise that resolves to the remote video MediaStreamTrack for the
   * given topic, received over WebRTC.
   *
   * Resolves immediately if the track has already arrived, or waits until the
   * remote peer sends it. Only available when connected via `Robot.connectWebrtcMqtt`
   * with `use_media_channels=true` (the robot gateway default).
   *
   * ```js
   * const track = await robot.extra.receiveVideoTrack('video')
   * videoEl.srcObject = new MediaStream([track])
   * videoEl.play()
   * ```
   *
   * @param topic  RTP video topic as configured on the gateway (default: `'video'`).
   * @throws {UnsupportedApiError} when not on a WebRTC transport.
   */
  receiveVideoTrack(topic = 'video'): Promise<MediaStreamTrack> {
    return this._webRtcConnection().receiveVideoTrack(topic)
  }

  /**
   * Return a Promise that resolves to the remote audio MediaStreamTrack for the
   * given topic, received over WebRTC.
   *
   * Resolves immediately if the track has already arrived, or waits until the
   * remote peer sends it. Only available when connected via `Robot.connectWebrtcMqtt`
   * with `use_media_channels=true` (the robot gateway default).
   *
   * ```js
   * const track = await robot.extra.receiveAudioTrack('audio')
   * const audio = new Audio()
   * audio.srcObject = new MediaStream([track])
   * audio.play()
   * ```
   *
   * @param topic  RTP audio topic as configured on the gateway (default: `'audio'`).
   * @throws {UnsupportedApiError} when not on a WebRTC transport.
   */
  receiveAudioTrack(topic = 'audio'): Promise<MediaStreamTrack> {
    return this._webRtcConnection().receiveAudioTrack(topic)
  }

  /**
   * Register a local video MediaStreamTrack to be sent to the remote peer over
   * WebRTC. Must be called before `connect()` — i.e. before the Robot is created.
   *
   * @param track  Local `MediaStreamTrack` of kind `"video"`.
   * @param topic  RTP video topic (default: `'video'`).
   * @throws {UnsupportedApiError} when not on a WebRTC transport.
   */
  sendVideoTrack(track: MediaStreamTrack, topic = 'video'): void {
    this._webRtcConnection().sendVideoTrack(track, topic)
  }

  /**
   * Register a local audio MediaStreamTrack to be sent to the remote peer over
   * WebRTC. Must be called before `connect()` — i.e. before the Robot is created.
   *
   * @param track  Local `MediaStreamTrack` of kind `"audio"`.
   * @param topic  RTP audio topic (default: `'audio'`).
   * @throws {UnsupportedApiError} when not on a WebRTC transport.
   */
  sendAudioTrack(track: MediaStreamTrack, topic = 'audio'): void {
    this._webRtcConnection().sendAudioTrack(track, topic)
  }

  private _webRtcConnection() {
    const transport: unknown = this._pluginTransport
      ?? (this._robot as unknown as { _transport: unknown })._transport
    if (!(transport instanceof WebRtcTransport)) {
      throw new UnsupportedApiError(
        'receiveVideoTrack() / receiveAudioTrack() / sendVideoTrack() / sendAudioTrack() require a WebRTC connection.'
      )
    }
    return transport.connection
  }
}
