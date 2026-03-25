export class RobotApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RobotApiError'
  }
}

/**
 * Race `promise` against `signal`. If the signal fires first, rejects with
 * the signal's reason (or a new `DOMException('Aborted', 'AbortError')`) and
 * invokes `onAbort` to send a cancel RPC on the remote side.
 */
export async function withSignal<T>(
  promise: Promise<T>,
  signal: AbortSignal,
  onAbort?: () => Promise<void>,
): Promise<T> {
  if (signal.aborted) {
    onAbort?.().catch(() => {})
    throw signal.reason ?? new DOMException('Aborted', 'AbortError')
  }
  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      onAbort?.().catch(() => {})
    }
    signal.addEventListener('abort', abort, { once: true })
    promise.then(
      val => { signal.removeEventListener('abort', abort); resolve(val) },
      err => { signal.removeEventListener('abort', abort); reject(err) },
    )
  })
}
