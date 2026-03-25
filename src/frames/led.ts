let _gidCounter = 0

export class LedColorFrame {
  private _gid: number
  private _id = 0
  r: number
  g: number
  b: number
  a: number

  constructor(r = 0, g = 0, b = 0, a = 1) {
    this._gid = ++_gidCounter
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }

  get id(): number { return this._id }
  set id(v: number) { this._id = v }

  toDict(): Record<string, unknown> {
    return {
      name: 'DictFrame',
      gid: this._gid,
      id: this._id,
      timestamp: String(Date.now() / 1000),
      value: { r: this.r, g: this.g, b: this.b, a: this.a },
    }
  }
}
