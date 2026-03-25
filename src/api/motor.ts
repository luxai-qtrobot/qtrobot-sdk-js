// AUTO-GENERATED — do not edit directly.
// Edit src/idl/api_core.ts (or api_plugins.ts) and run `npm run gen`.

import type { Robot } from '../client'
import { TypedStreamReader, TypedStreamWriter } from '../streams'
import { JointCommandFrame } from '../frames/joint_command'
import { JointStateFrame } from '../frames/joint_state'

export type MotorOnOptions = {
  /** Motor name to enable torque. */
  motor: string
}

export type MotorOffOptions = {
  /** Motor name to disable torque. */
  motor: string
}

export type MotorHomeOptions = {
  /** Motor name to move to its home position. */
  motor: string
}

export type MotorSetVelocityOptions = {
  /** Motor name. */
  motor: string
  /** Velocity value (0 .. velocity_max). */
  velocity: number
}

export type MotorSetCalibOptions = {
  /** Motor name. */
  motor: string
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
   * @returns Record<string, unknown>
   */
  async list(): Promise<Record<string, unknown>> {
    return this._robot.rpcCall<Record<string, unknown>>('/motor/list', {})
  }

  /**
   * Enable torque for a motor.
   * @param options.motor Motor name to enable torque.
   */
  async on(options: MotorOnOptions): Promise<void> {
    await this._robot.rpcCall('/motor/on', options as Record<string, unknown>)
  }

  /**
   * Disable torque for a motor.
   * @param options.motor Motor name to disable torque.
   */
  async off(options: MotorOffOptions): Promise<void> {
    await this._robot.rpcCall('/motor/off', options as Record<string, unknown>)
  }

  /**
   * Enable torque for all motors.
   */
  async onAll(): Promise<void> {
    await this._robot.rpcCall('/motor/on/all', {})
  }

  /**
   * Disable torque for all motors.
   */
  async offAll(): Promise<void> {
    await this._robot.rpcCall('/motor/off/all', {})
  }

  /**
   * Move a motor to its home position.
   * @param options.motor Motor name to move to its home position.
   */
  async home(options: MotorHomeOptions): Promise<void> {
    await this._robot.rpcCall('/motor/move/home', options as Record<string, unknown>)
  }

  /**
   * Move all motors to their home positions.
   */
  async homeAll(): Promise<void> {
    await this._robot.rpcCall('/motor/move/home/all', {})
  }

  /**
   * Set the velocity limit for a motor.
   * @param options.motor Motor name.
   * @param options.velocity Velocity value (0 .. velocity_max).
   */
  async setVelocity(options: MotorSetVelocityOptions): Promise<void> {
    await this._robot.rpcCall('/motor/velocity/set', options as Record<string, unknown>)
  }

  /**
   * Set calibration parameters for a motor.
   * @param options.motor Motor name.
   * @param options.offset Calibration offset in degrees.
   * @param options.overload_threshold Overload threshold value.
   * @param options.velocity_max Maximum velocity value.
   * @param options.store Persist the calibration to config file.
   */
  async setCalib(options: MotorSetCalibOptions): Promise<void> {
    await this._robot.rpcCall('/motor/calib/set', options as Record<string, unknown>)
  }

  /**
   * Apply stored calibration to all motors.
   */
  async calibAll(): Promise<void> {
    await this._robot.rpcCall('/motor/calib/all', {})
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
   * @param options.queueSize Internal frame buffer size (default: 2).
   */
  jointsStateReader(options?: { queueSize?: number }): TypedStreamReader<JointStateFrame> {
    return this._robot.getStreamReader<JointStateFrame>(
      '/motor/joints/state/stream:o',
      JointStateFrame.fromRaw,
      options?.queueSize,
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
   * @param options.queueSize Internal frame buffer size (default: 2).
   */
  jointsErrorReader(options?: { queueSize?: number }): TypedStreamReader<Record<string, unknown>> {
    return this._robot.getStreamReader<Record<string, unknown>>(
      '/motor/joints/error/stream:o',
      raw => ((raw as { value?: Record<string, unknown> }).value ?? raw as Record<string, unknown>),
      options?.queueSize,
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
