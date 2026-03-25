// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { TypedStreamReader } from '../streams'
import { Frame, ImageFrameRaw } from '@luxai-qtrobot/magpie'

export class CameraApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * Get color camera intrinsic parameters (fx, fy, ppx, ppy, width, height, model, coeffs).
   * @param timeoutSec RPC timeout in seconds.
   * @returns Record<string, unknown>
   */
  async getColorIntrinsics(timeoutSec?: number): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/camera/color/intrinsics', {  }, timeoutSec)
  }

  /**
   * Get depth camera intrinsic parameters (fx, fy, ppx, ppy, width, height, model, coeffs).
   * @param timeoutSec RPC timeout in seconds.
   * @returns Record<string, unknown>
   */
  async getDepthIntrinsics(timeoutSec?: number): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/camera/depth/intrinsics', {  }, timeoutSec)
  }

  /**
   * Get the depth scale factor (metres per depth unit). Returns { scale: number }.
   * @param timeoutSec RPC timeout in seconds.
   * @returns Record<string, unknown>
   */
  async getDepthScale(timeoutSec?: number): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/camera/depth/scale', {  }, timeoutSec)
  }

  /**
   * Outbound colour image stream from the RealSense camera (BGR, width × height × 3).
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onColor(handler: (frame: ImageFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<ImageFrameRaw>(
      '/camera/color/image',
      raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound colour image stream from the RealSense camera (BGR, width × height × 3).
   *
   * @example
   * for await (const frame of robot.camera.colorReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  colorReader(queueSize?: number): TypedStreamReader<ImageFrameRaw> {
    return this._robot.getStreamReader<ImageFrameRaw>(
      '/camera/color/image',
      raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound depth image stream from the RealSense camera (16-bit, width × height).
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onDepth(handler: (frame: ImageFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<ImageFrameRaw>(
      '/camera/depth/image',
      raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound depth image stream from the RealSense camera (16-bit, width × height).
   *
   * @example
   * for await (const frame of robot.camera.depthReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  depthReader(queueSize?: number): TypedStreamReader<ImageFrameRaw> {
    return this._robot.getStreamReader<ImageFrameRaw>(
      '/camera/depth/image',
      raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound depth image aligned to the colour frame (16-bit, same resolution as colour).
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onDepthAligned(handler: (frame: ImageFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<ImageFrameRaw>(
      '/camera/depth/aligned/image',
      raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound depth image aligned to the colour frame (16-bit, same resolution as colour).
   *
   * @example
   * for await (const frame of robot.camera.depthAlignedReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  depthAlignedReader(queueSize?: number): TypedStreamReader<ImageFrameRaw> {
    return this._robot.getStreamReader<ImageFrameRaw>(
      '/camera/depth/aligned/image',
      raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound false-colour depth image stream (BGR, colourised for visualisation).
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onDepthColor(handler: (frame: ImageFrameRaw) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<ImageFrameRaw>(
      '/camera/depth/color/image',
      raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound false-colour depth image stream (BGR, colourised for visualisation).
   *
   * @example
   * for await (const frame of robot.camera.depthColorReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  depthColorReader(queueSize?: number): TypedStreamReader<ImageFrameRaw> {
    return this._robot.getStreamReader<ImageFrameRaw>(
      '/camera/depth/color/image',
      raw => Frame.fromDict(raw as Record<string, unknown>) as ImageFrameRaw,
      queueSize,
    )
  }

  /**
   * Outbound gyroscope stream from the RealSense IMU — [x, y, z] angular velocity (rad/s).
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onGyro(handler: (frame: unknown[]) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<unknown[]>(
      '/camera/gyro',
      raw => ((raw as { value?: unknown[] }).value ?? []),
    ).onFrame(handler, onError)
  }

  /**
   * Outbound gyroscope stream from the RealSense IMU — [x, y, z] angular velocity (rad/s).
   *
   * @example
   * for await (const frame of robot.camera.gyroReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  gyroReader(queueSize?: number): TypedStreamReader<unknown[]> {
    return this._robot.getStreamReader<unknown[]>(
      '/camera/gyro',
      raw => ((raw as { value?: unknown[] }).value ?? []),
      queueSize,
    )
  }

  /**
   * Outbound accelerometer stream from the RealSense IMU — [x, y, z] linear acceleration (m/s²).
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onAcceleration(handler: (frame: unknown[]) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<unknown[]>(
      '/camera/acceleration',
      raw => ((raw as { value?: unknown[] }).value ?? []),
    ).onFrame(handler, onError)
  }

  /**
   * Outbound accelerometer stream from the RealSense IMU — [x, y, z] linear acceleration (m/s²).
   *
   * @example
   * for await (const frame of robot.camera.accelerationReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  accelerationReader(queueSize?: number): TypedStreamReader<unknown[]> {
    return this._robot.getStreamReader<unknown[]>(
      '/camera/acceleration',
      raw => ((raw as { value?: unknown[] }).value ?? []),
      queueSize,
    )
  }

}
