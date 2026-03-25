import { StreamReader, StreamWriter, TimeoutError } from '@luxai-qtrobot/magpie'

export type FrameFactory<T> = (raw: unknown) => T
export type FrameSerializer<T> = (frame: T) => unknown

export class TypedStreamReader<T> {
  private _closed = false
  private _loopRunning = false

  constructor(
    private readonly _reader: StreamReader,
    private readonly _factory: FrameFactory<T>,
  ) {}

  /**
   * Callback style. Starts a background loop and calls the handler for each frame.
   * Returns an unsubscribe function that stops the loop and closes the reader.
   */
  onFrame(handler: (frame: T) => void, onError?: (err: Error) => void): () => void {
    this._startLoop(handler, onError)
    return () => this.close()
  }

  /**
   * Direct async read. Call in a loop or use the async iterator instead.
   * @param timeoutSec Seconds to wait before throwing TimeoutError (default: no timeout)
   */
  async read(timeoutSec?: number): Promise<T> {
    const [raw] = await this._reader.read(timeoutSec)
    return this._factory(raw)
  }

  /** Async iterator — use with `for await (const frame of reader)` */
  async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    while (!this._closed) {
      try {
        yield await this.read(1.0)
      } catch (e) {
        if (e instanceof TimeoutError) continue
        break
      }
    }
  }

  close(): void {
    this._closed = true
    this._reader.close()
  }

  private _startLoop(handler: (frame: T) => void, onError?: (err: Error) => void): void {
    if (this._loopRunning) return
    this._loopRunning = true
    ;(async () => {
      while (!this._closed) {
        try {
          const frame = await this.read(1.0)
          handler(frame)
        } catch (e) {
          if (e instanceof TimeoutError) continue
          if (this._closed) break
          onError?.(e as Error)
          break
        }
      }
      this._loopRunning = false
    })()
  }
}

export class TypedStreamWriter<T> {
  private _closed = false

  constructor(
    private readonly _writer: StreamWriter,
    private readonly _topic: string,
    private readonly _serializer: FrameSerializer<T>,
  ) {}

  async write(frame: T): Promise<void> {
    if (this._closed) return
    await this._writer.write(this._serializer(frame), this._topic)
  }

  close(): void {
    this._closed = true
    this._writer.close()
  }
}
