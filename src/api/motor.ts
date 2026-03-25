// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { TypedStreamReader, TypedStreamWriter } from '../streams'
import { JointCommandFrame } from '../frames/joint_command'
import { JointStateFrame } from '../frames/joint_state'

export type MotorSetCalibOptions = {
  /** Calibration offset in degrees. */
  offset?: number
  /** Overload threshold value. */
  overload_threshold?: number
  /** Maximum velocity value. */
  velocity_max?: number
  /** Persist the calibration to config file. */
  store?: boolean
}

export class MotorApi {
  constructor(private readonly _robot: Robot) {}

  /**
   * List available motors and their configuration properties.
   * @param timeoutSec RPC timeout in seconds.
   * @returns Record<string, unknown>
   */
  async list(timeoutSec?: number): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/motor/list', {  }, timeoutSec)
  }

  /**
   * Enable torque for a motor.
   * @param motor Motor name to enable torque.
   * @param timeoutSec RPC timeout in seconds.
   */
  async on(motor: string, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/on', { motor }, timeoutSec)
  }

  /**
   * Disable torque for a motor.
   * @param motor Motor name to disable torque.
   * @param timeoutSec RPC timeout in seconds.
   */
  async off(motor: string, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/off', { motor }, timeoutSec)
  }

  /**
   * Enable torque for all motors.
   * @param timeoutSec RPC timeout in seconds.
   */
  async onAll(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/on/all', {  }, timeoutSec)
  }

  /**
   * Disable torque for all motors.
   * @param timeoutSec RPC timeout in seconds.
   */
  async offAll(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/off/all', {  }, timeoutSec)
  }

  /**
   * Move a motor to its home position.
   * @param motor Motor name to move to its home position.
   * @param timeoutSec RPC timeout in seconds.
   */
  async home(motor: string, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/move/home', { motor }, timeoutSec)
  }

  /**
   * Move all motors to their home positions.
   * @param timeoutSec RPC timeout in seconds.
   */
  async homeAll(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/move/home/all', {  }, timeoutSec)
  }

  /**
   * Set the velocity limit for a motor.
   * @param motor Motor name.
   * @param velocity Velocity value (0 .. velocity_max).
   * @param timeoutSec RPC timeout in seconds.
   */
  async setVelocity(motor: string, velocity: number, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/velocity/set', { motor, velocity }, timeoutSec)
  }

  /**
   * Set calibration parameters for a motor.
   * @param motor Motor name.
   * @param options Optional parameters.
   * @param timeoutSec RPC timeout in seconds.
   */
  async setCalib(motor: string, options?: MotorSetCalibOptions, timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/calib/set', { motor, ...options }, timeoutSec)
  }

  /**
   * Apply stored calibration to all motors.
   * @param timeoutSec RPC timeout in seconds.
   */
  async calibAll(timeoutSec?: number): Promise<void> {
    await this._robot.rpcCall('/motor/calib/all', {  }, timeoutSec)
  }

  /**
   * Outbound joint state stream (position, velocity, effort, voltage, temperature).
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onJointsState(handler: (frame: JointStateFrame) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<JointStateFrame>(
      '/motor/joints/state/stream:o',
      JointStateFrame.fromRaw,
    ).onFrame(handler, onError)
  }

  /**
   * Outbound joint state stream (position, velocity, effort, voltage, temperature).
   *
   * @example
   * for await (const frame of robot.motor.jointsStateReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  jointsStateReader(queueSize?: number): TypedStreamReader<JointStateFrame> {
    return this._robot.getStreamReader<JointStateFrame>(
      '/motor/joints/state/stream:o',
      JointStateFrame.fromRaw,
      queueSize,
    )
  }

  /**
   * Outbound joint error stream (overload, voltage, temperature, sensor failure flags).
   * @param handler Called for each incoming frame.
   * @param onError Called if the stream encounters an error.
   * @returns Unsubscribe function.
   */
  onJointsError(handler: (frame: Record<string, unknown>) => void, onError?: (err: Error) => void): () => void {
    return this._robot.getStreamReader<Record<string, unknown>>(
      '/motor/joints/error/stream:o',
      raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>),
    ).onFrame(handler, onError)
  }

  /**
   * Outbound joint error stream (overload, voltage, temperature, sensor failure flags).
   *
   * @example
   * for await (const frame of robot.motor.jointsErrorReader()) {
   *   // handle frame
   * }
   * @param queueSize Internal frame buffer size (default: 2).
   */
  jointsErrorReader(queueSize?: number): TypedStreamReader<Record<string, unknown>> {
    return this._robot.getStreamReader<Record<string, unknown>>(
      '/motor/joints/error/stream:o',
      raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>),
      queueSize,
    )
  }

  /**
   * Inbound joint command stream — send position/velocity commands to motors.
   * @returns Stream writer. Call `writer.write(frame)` to send frames.
   */
  openJointsCommandWriter(): TypedStreamWriter<JointCommandFrame> {
    return this._robot.getStreamWriter<JointCommandFrame>(
      '/motor/joints/command/stream:i',
      f => f.toDict(),
    )
  }

}
