type JointParams = {
  position?: number
  velocity?: number
  effort?: number
}

let _gidCounter = 0

export class JointCommandFrame {
  private _joints: Record<string, Required<JointParams>> = {}
  private _gid: number
  private _id = 0

  constructor() {
    this._gid = ++_gidCounter
  }

  get id(): number { return this._id }
  set id(v: number) { this._id = v }

  setJoint(joint: string, params: JointParams): this {
    const existing = this._joints[joint] ?? { position: 0, velocity: 0, effort: 0 }
    this._joints[joint] = { ...existing, ...params } as Required<JointParams>
    return this
  }

  clear(): this {
    this._joints = {}
    return this
  }

  toDict(): Record<string, unknown> {
    return {
      name: 'DictFrame',
      gid: this._gid,
      id: this._id,
      timestamp: String(Date.now() / 1000),
      value: this._joints,
    }
  }
}

type TrajectoryPoint = {
  time_from_start: number
  joints: Record<string, JointParams>
}

export class JointTrajectoryFrame {
  private _points: TrajectoryPoint[] = []
  private _gid: number
  private _id = 0

  constructor() {
    this._gid = ++_gidCounter
  }

  get id(): number { return this._id }
  set id(v: number) { this._id = v }

  addPoint(timeFromStart: number, joints: Record<string, JointParams>): this {
    this._points.push({ time_from_start: timeFromStart, joints })
    return this
  }

  clear(): this {
    this._points = []
    return this
  }

  toDict(): Record<string, unknown> {
    return {
      name: 'DictFrame',
      gid: this._gid,
      id: this._id,
      timestamp: String(Date.now() / 1000),
      value: { points: this._points },
    }
  }
}
