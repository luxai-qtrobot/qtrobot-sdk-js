import { Logger } from '@luxai-qtrobot/magpie'

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
  onAbort?: () => Promise<unknown>,
): Promise<T> {
  if (signal.aborted) {
    await onAbort?.().catch(e => Logger.warning(`withSignal: cancel RPC failed: ${e}`))
    throw signal.reason ?? new DOMException('Aborted', 'AbortError')
  }
  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      const error = signal.reason ?? new DOMException('Aborted', 'AbortError')
      // Wait for the cancel RPC to complete before unblocking the caller.
      // This ensures the cancel command reaches the robot before the caller's
      // await chain continues and potentially closes the transport.
      ;(onAbort?.().catch(e => Logger.warning(`withSignal: cancel RPC failed: ${e}`)) ?? Promise.resolve()).then(() => reject(error))
    }
    signal.addEventListener('abort', abort, { once: true })
    promise.then(
      val => { signal.removeEventListener('abort', abort); resolve(val) },
      err => { signal.removeEventListener('abort', abort); reject(err) },
    )
  })
}
