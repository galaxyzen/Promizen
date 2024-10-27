'use strict'

/**
 * @file Promizen: a promise implementation of Promises/A+ specification.
 * @author galaxyzen
 * @version 1.0.0
 * @see {@link https://promisesaplus.com|Promises/A+} for detailed specification.
 * @see {@link https://tc39.github.io/ecma262/#sec-promise-objects|ECMAScript specification} for comprehensive information on "perfect" promise.
 * @see {@link https://github.com/promises-aplus/promises-tests|promises-aplus/promises-tests} for more information on the Promises/A+ Compliance Test Suite.
 */

/** @constant {string} PENDING - Represents the initial state of a promizen, before it has been settled (fulfilled or rejected). */
const PENDING = 'pending'

/** @constant {string} FULFILLED - Represents the state of a promizen that has been fulfilled with a value. */
const FULFILLED = 'fulfilled'

/** @constant {string} REJECTED - Represents the state of a promizen that has been rejected with an error. */
const REJECTED = 'rejected'

/** @constant {string} UNRESOLVED - Represents the fate of a promizen that has not yet been resolved. */
const UNRESOLVED = 'unresolved'

/** @constant {string} RESOLVED - Represents the fate of a promizen that has been resolved. */
const RESOLVED = 'resolved'

class Promizen {
  /**
   * Creates a new Promizen instance.
   *
   * @class
   * @param {Function} executor - A function that will be synchronously executed, passed with the methods {@linkcode resolve} and {@linkcode reject}.
   * @throws {TypeError} Throws a TypeError if the executor is not a function.
   */
  constructor (executor) {
    this.__fate = UNRESOLVED
    this.state = PENDING
    this.value = null
    this.reason = null
    this.__pendingHandlers = []

    if (typeof executor !== 'function') {
      executor() // just for throwing TypeError
    }

    try {
      executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
      this.reject(e)
    }
  }

  /**
   * Resolves the promizen with the given value.
   *
   * <p>
   *  The resolution process:
   *  <ol style="list-style-type: none">
   *    <li>1. If the value is a thenable, the current promizen's state will match the value's state:
   *      <ol style="list-style-type: none">
   *        <li>1.1 If the value is a promizen, the current promizen's final state will be consistent with the value's final state.</li>
   *        <li>1.2. Otherwise, the current promizen will call the value's then method with a function termed onFulfilled which has a parameter "value",
   *          and a function termed onRejected with a parameter "reason". The value's then method may call back the onFulfilled or the onRejected function:
   *          <ol style="list-style-type: none">
   *            <li>1.2.1. The onFulfilled will recursively perform the resolution process with the value back passed by the then method.</li>
   *            <li>1.2.2. The OnRejected will reject the current promizen with the reason back passed by the then method.</li>
   *            <li>1.2.3. If the then method throws an error:
   *            <ol style="list-style-type: none">
   *              <li>1.2.3.1. If onFulfilled or onRejected has already been called, ignore the error.</li>
   *              <li>1.2.3.2. Otherwise, the current promizen will be {@linkcode REJECTED} with the error.</li>
   *            </ol>
   *          </ol>
   *        <li>
   *      </ol>
   *    <li>
   *    <li>2. Otherwise, the current promizen will be {@linkcode FULFILLED} with the value.</li>
   *  </ol>
   * </p>
   * <p>
   *  When resolve is invoked for the first time, the promizen's fate transitions from {@linkcode UNRESOLVED} to {@linkcode RESOLVED},
   *  with any subsequent invocations proving ineffective.<br/>
   *  Note that when the promizen's fate is {@linkcode RESOLVED}, its state may still be {@linkcode PENDING},
   *  as the promizen will be settled asynchronously if the value is a thenable.
   *  See [Promises Unwrapping]{@link https://github.com/domenic/promises-unwrapping} for more information of States and Fates.
   * </p>
   *
   * @param {*} value - The value for the resolution.
   * @returns {void}
   */
  resolve (value) {
    if (this.__fate === RESOLVED || this.state !== PENDING) {
      return
    }
    this.__fate = RESOLVED
    this.__resolveValue(value)
  }

  __resolve (value) {
    this.state = FULFILLED
    this.value = value
    this.__pendingHandlers.forEach((handler) => {
      handler.onFulfilled()
    })
  }

  /**
   * Rejects the promizen with the given reason.
   *
   * <p>
   *  The rejection process is very simple, just set the promizen's state to {@linkcode REJECTED} with the given reason.<br/>
   *  When resolve is invoked for the first time, the promizen's fate transitions from {@linkcode UNRESOLVED} to {@linkcode RESOLVED},
   *  with any subsequent invocations proving ineffective.
   * </p>
   *
   * @param {*} reason - The reason for the rejection.
   * @returns {void}
   */
  reject (reason) {
    if (this.__fate === RESOLVED || this.state !== PENDING) {
      return
    }
    this.__fate = RESOLVED
    this.__reject(reason)
  }

  __reject (reason) {
    this.state = REJECTED
    this.reason = reason
    this.__pendingHandlers.forEach((handler) => {
      handler.onRejected()
    })
  }

  /**
   * Attaches handlers for the resolution and/or rejection of the promizen.
   *
   * <p>
   *  The method receives two handlers: onFulfilled for the resolution and onRejected for the rejection.
   *  As agreed, the onFulfilled receives the resolved value of the current promizen as its argument,
   *  and the onRejected receives the rejected reason of the current promizen as its argument.
   * </p>
   *
   * <p>
   *  It's interesting that the handlers won't be executed immediately even if the promizen is already settled,
   *  the handlers will be deferred to the micro-task queue:
   *  <ol style="list-style-type: none">
   *    <li>1. If the current promizen's state is {@linkcode FULFILLED}, the onFulfilled will be queued to the micro-task queue immediately.</li>
   *    <li>2. If the current promizen's state is {@linkcode REJECTED}, the onRejected will be queued to the micro-task queue immediately.</li>
   *    <li>
   *      3. Otherwise, if the promizen is {@linkcode PENDING}, the onFulfilled and onRejected handlers will be stashed,
   *      and queued to the micro-task queue when the promizen is settled.
   *   </li>
   *  </ol>
   *  The queued onFulfilled or onRejected will be dequeued and executed, when the event-cycle reaches the micro-task queue,
   *  and the argument (value or reason of current promizen) passed to the handler is previous captured by closure.
   * </p>
   *
   * <p>
   *  The then method immediately returns a new promizen, which is the key to promizen chaining.
   *  The new promizen will be resolved with the return value of the handlers or rejected with the error thrown from the handlers.
   *  The onFulfilled and onRejected handlers are optional. If they are not functions, they will be ignored, and the new Promizen
   *  will be resolved with the current promizen's value or rejected with the current promizen's reason.
   * </p>
   *
   * @param {function} [onFulfilled] - The handler to execute when the promizen is {@linkcode FULFILLED}.
   * @param {function} [onRejected] - The handler to execute when the promizen is {@linkcode REJECTED}.
   * @returns {Promizen} A new promizen resolved with the return value of the handlers or rejected with the error thrown from the handlers.
   */
  then (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value
    onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason }

    const promizen = new Promizen((resolve, reject) => {
      const fulfilledAction = () => {
        queueMicrotask(() => {
          try {
            resolve(onFulfilled(this.value))
          } catch (e) {
            reject(e)
          }
        })
      }

      const rejectedAction = () => {
        queueMicrotask(() => {
          try {
            resolve(onRejected(this.reason))
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.state === FULFILLED) {
        fulfilledAction()
        return
      }

      if (this.state === REJECTED) {
        rejectedAction()
        return
      }

      this.__pendingHandlers.push({
        onFulfilled: fulfilledAction,
        onRejected: rejectedAction
      })
    })
    return promizen
  }

  /**
   * Attaches the handler for the rejection of the promizen.
   *
   * <p>Just alias <code>then(null, onRejected)</code></p>
   *
   * @param {function} [onRejected] - The handler to execute when the promizen is {@linkcode REJECTED}.
   * @returns {Promizen} A new promizen resolved with the return value of the handler or rejected with the error thrown from the handler.
   */
  catch (onRejected) {
    return this.then(null, onRejected)
  }

  /**
   * Resolves the current promizen by the given value x.
   *
   * <p>The resolution process implementation, as described in the {@linkcode resolve} method.</p>
   *
   * @param {*} x - The value to resolve the current promizen with.
   * @private
   *
   * @throws {TypeError} If the current promizen and the x are the same.
   */
  __resolveValue (x) {
    if (this === x) {
      this.__reject(new TypeError('chaining cycle detected for the promizen resolution'))
      return
    }

    if (x instanceof Promizen) {
      x.then(value => this.__resolve(value), reason => this.__reject(reason))
      return
    }

    if (x === null || (typeof x !== 'object' && typeof x !== 'function')) {
      this.__resolve(x)
      return
    }

    let thenFunc
    try {
      thenFunc = x.then
    } catch (e) {
      this.__reject(e)
      return
    }

    if (typeof thenFunc !== 'function') {
      this.__resolve(x)
      return
    }

    let called = false
    try {
      thenFunc.call(
        x,
        value => {
          if (called) {
            return
          }
          called = true
          this.__resolveValue(value)
        },
        reason => {
          if (called) {
            return
          }
          called = true
          this.__reject(reason)
        }
      )
    } catch (e) {
      if (called) {
        return
      }
      this.__reject(e)
    }
  }
}

module.exports = Promizen
