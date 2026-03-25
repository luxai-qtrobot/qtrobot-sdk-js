export class RobotApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RobotApiError'
  }
}

export class ActionCancelledError extends Error {
  constructor() {
    super('Action was cancelled')
    this.name = 'ActionCancelledError'
  }
}

export class ActionHandle<T = unknown> {
  private readonly _result: Promise<T>
  private readonly _cancelFn: (() => Promise<void>) | null

  constructor(result: Promise<T>, cancelFn: (() => Promise<void>) | null = null) {
    this._result = result
    this._cancelFn = cancelFn
  }

  /** Await the action result. Rejects with RobotApiError on failure. */
  get result(): Promise<T> {
    return this._result
  }

  /** Cancel the action. No-op if the action has no cancel service. */
  async cancel(): Promise<void> {
    if (this._cancelFn) await this._cancelFn()
  }

  /** Allow ActionHandle to be used directly with await. */
  then<R>(
    onFulfilled: (value: T) => R | PromiseLike<R>,
    onRejected?: (reason: unknown) => R | PromiseLike<R>,
  ): Promise<R> {
    return this._result.then(onFulfilled, onRejected)
  }

  catch<R>(onRejected: (reason: unknown) => R | PromiseLike<R>): Promise<T | R> {
    return this._result.catch(onRejected)
  }

  finally(onFinally?: () => void): Promise<T> {
    return this._result.finally(onFinally)
  }
}
