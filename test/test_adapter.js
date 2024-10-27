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
    const promizen = new Promizen(() => {})
    return {
      promise: promizen,
      resolve: promizen.resolve.bind(promizen),
      reject: promizen.reject.bind(promizen)
    }
  }
}
