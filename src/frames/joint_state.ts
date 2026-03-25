type JointData = {
  position: number
  velocity: number
  effort: number
  temperature: number
  voltage: number
}

export class JointStateFrame {
  private _data: Record<string, JointData>

  private constructor(data: Record<string, JointData>) {
    this._data = data
  }

  static fromRaw(raw: unknown): JointStateFrame {
    const dict = raw as { value?: Record<string, JointData> }
    return new JointStateFrame(dict.value ?? (raw as Record<string, JointData>))
  }

  joints(): string[] {
    return Object.keys(this._data)
  }

  position(joint: string): number {
    return this._data[joint]?.position ?? 0
  }

  velocity(joint: string): number {
    return this._data[joint]?.velocity ?? 0
  }

  effort(joint: string): number {
    return this._data[joint]?.effort ?? 0
  }

  temperature(joint: string): number {
    return this._data[joint]?.temperature ?? 0
  }

  voltage(joint: string): number {
    return this._data[joint]?.voltage ?? 0
  }

  jointData(joint: string): JointData | undefined {
    return this._data[joint]
  }
}
