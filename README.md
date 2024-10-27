# Promizen
Promizen is an implementation of the Promises/A+ specification, passing the [promises-aplus/promises-tests](https://github.com/promises-aplus/promises-tests) test.

## Prerequisites

I will not delve into the features of Promizen here, as this repository is intended primarily for JavaScript knowledge and technology sharing session, and Promizen itself is merely a compliant implementation of the Promise/A+ specification, with nothing particularly surprising. Below, I will list some of the resources that were crucial to the my development of Promizen.

- Refer to the [Promises/A+](https://promisesaplus.com) specification for detailed guidelines, If you want to implement your own Promise.

    The Promises/A+ specification focuses on the behavior of the `then` method, which is pivotal for handling asynchronous tasks and chaining operations in an elegant coding way.

    Beyond the core `then` functionality, the Promise `constructor` along with the`resolve`, `reject` and additional methods, play a vital role in implementing a robust and acceptable Promise (I mean, based on compliance with the Promise/A+specification, the custom Promise we implemented can exhibit behavior and usage patterns that are virtually indistinguishable from those found in modern web browsers).

    The [ECMAScript specification](https://tc39.github.io/ecma262/#sec-promise-objects) is the most authoritative reference for obtaining the comprehensive information. However, if you find the extensive and formal documentation overwhelming, the GitHub repository [Promises Unwrapping](https://github.com/domenic/promises-unwrapping), which closely mirrors the specification, offers a more accessible alternative. Additionally, the MDN documentation on [Asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous) provides an in-depth look at asynchronous JavaScript and Promise, making it a user-friendly resource that is easier to understand.

- To verify whether our implementation adheres to the Promise/A+ specification, we can utilize the test suite available from the Github repository [promises-aplus/promises-tests](https://github.com/promises-aplus/promises-tests). Successfully passing this test suite is the gold standard for ensuring that our Promise conforms to the Promise/A+ specification.


## Install

Install with [npm](https://www.npmjs.com/package/promizen):

```sh
npm i promizen
```

## Usage
```js
const Promizen = require('promizen')

// create a new Promizen instance with an executor.
const promizen = new Promizen((resolve, reject) => {
  console.log("Hello!")
  setTimeout(() => { resolve('How are u?') }, 0)
})

// Promizen supports then chaining
// The then method returns a new Promizen instance
const newPromizen = promizen.then((value) => {
    console.log('First then:', value)
    return "I'm fine, thanks, and u?"
  }
).then((value) => {
  console.log('Second then:', value)
  throw "I'm not fine."
}).catch((reason) => {
  console.error('Catch:', reason)
})

// check the status of promizens by logging
console.log('promizen:', promizen)
setTimeout(() => { console.log('promizen:', promizen) }, 0)
console.log('newPromizen', newPromizen)
setTimeout(() => { console.log('newPromizen:', newPromizen) }, 0)

/**
 * output:
 * Hello!
 * promizen: Promizen {
 *   __fate: 'unresolved',
 *   state: 'pending',
 *   value: null,
 *   reason: null,
 *   __pendingHandlers: [
 *     {
 *       onFulfilled: [Function: fulfilledAction],
 *       onRejected: [Function: rejectedAction]
 *     }
 *   ]
 * }
 * newPromizen Promizen {
 *   __fate: 'unresolved',
 *   state: 'pending',
 *   value: null,
 *   reason: null,
 *   __pendingHandlers: []
 * }
 * First then: How are u?
 * Second then: I'm fine, thanks, and u?
 * Catch: I'm not fine.
 * promizen: Promizen {
 *   __fate: 'resolved',
 *   state: 'fulfilled',
 *   value: 'How are u?',
 *   reason: null,
 *   __pendingHandlers: [
 *     {
 *       onFulfilled: [Function: fulfilledAction],
 *       onRejected: [Function: rejectedAction]
 *     }
 *   ]
 * }
 * newPromizen: Promizen {
 *   __fate: 'resolved',
 *   state: 'fulfilled',
 *   value: undefined,
 *   reason: null,
 *   __pendingHandlers: []
 * }
 */
```
