'use strict'

const Promizen = require('../index')

module.exports = {
  resolved (value) {
    return new Promizen((resolve) => resolve(value))
  },
  rejected (reason) {
    return new Promizen((_, reject) => reject(reason))
  },
  deferred () {
    let resolveDeferred
    let rejectDeferred
    const promizen = new Promizen((resolve, reject) => {
      resolveDeferred = resolve
      rejectDeferred = reject
    })
    return {
      promise: promizen,
      resolve: resolveDeferred,
      reject: rejectDeferred
    }
  }
}
