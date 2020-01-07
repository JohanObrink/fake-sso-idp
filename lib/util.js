const { createHash, randomBytes } = require('crypto')

function createId (url) {
  const md5 = createHash('md5')
  md5.update(url)
  return `_${md5.digest('hex')}`
}

function createSessionId () {
  return randomBytes(32).toString('hex')
}

module.exports = { createId, createSessionId }
