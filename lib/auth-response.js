const { inflateRaw } = require('zlib')
const { readFileSync } = require('fs')
const { template } = require('lodash')
const { SignedXml } = require('xml-crypto')
const { toJson } = require('xml2json')
const moment = require('moment')
const { createId, createSessionId } = require('./util')

const xmlTemplate = template(readFileSync(`${__dirname}/templates/auth-answer.xml`, { encoding: 'utf8' }))
const privateKey = readFileSync(`${__dirname}/certs/private.key`, { encoding: 'utf8' })

function sign (xml) {
  const sig = new SignedXml()
  const assertion = '/*[local-name()=\'Response\']/*[local-name()=\'Assertion\']'
  const issuer = `${assertion}/*[local-name()='Issuer']`
  sig.addReference(assertion, [
    'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
    'http://www.w3.org/2001/10/xml-exc-c14n#'
  ], 'http://www.w3.org/2000/09/xmldsig#sha1')
  sig.signingKey = privateKey
  sig.computeSignature(xml, { prefix: 'ds', location: { reference: issuer, action: 'after' } })
  return sig.getSignedXml()
}

function parseRequest (request) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(request.SAMLRequest, 'base64')
    inflateRaw(buf, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve([result, request.RelayState])
      }
    })
  })
    .then(([buf, relayState]) => [buf.toString('utf8'), relayState])
    .then(([xml, relayState]) => [toJson(xml, { object: true }), relayState])
    .then(([req, relayState]) => {
      const root = req[Object.keys(req)[0]]
      return {
        destination: root.AssertionConsumerServiceURL,
        inResponseTo: root.ID,
        relayState: relayState
      }
    })
}

function createResponse (options, request, user) {
  const responseProperties = {
    authnInstant: moment().toISOString(),
    issueInstant: moment().toISOString(),
    notBefore: moment().toISOString(),
    notOnOrAfter: moment().add(500, 'm').toISOString(),
    sessionIndex: createSessionId()
  }
  const data = Object.assign({}, options, request, responseProperties, { user })
  data.assertionId = createId(JSON.stringify(data))
  const xml = xmlTemplate(data)
  const signedXml = sign(xml)
  const buf = Buffer.from(signedXml, 'utf8')

  return Object.assign(data, {
    action: request.destination,
    response: buf.toString('base64'),
    relayState: request.relayState
  })
}

module.exports = { parseRequest, createResponse }
