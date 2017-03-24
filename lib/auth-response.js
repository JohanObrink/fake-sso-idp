const {readFileSync} = require('fs')
const {template} = require('lodash')
const {SignedXml} = require('xml-crypto')
const moment = require('moment')

const xmlTemplate = template(readFileSync(`${__dirname}/templates/auth-answer.xml`, {encoding: 'utf8'}))
const privateKey = readFileSync(`${__dirname}/certs/private.key`, {encoding: 'utf8'})
const publicCert = readFileSync(`${__dirname}/certs/public.pem`, {encoding: 'utf8'})
const data = {
  destination: 'https://af-api-test.iteamdev.se/auth/saml/callback',
  authnInstant: moment().toISOString(),
  issueInstant: moment().toISOString(),
  entity: 'https://idp.arbetsformedlingen.se/idp/shibboleth',
  nameQualifier: 'https://idp.arbetsformedlingen.se/idp/shibboleth',
  spNameQualifier: 'https://af-api-test.iteamdev.se/auth/saml/metadata.xml',
  notBefore: moment().toISOString(),
  notOnOrAfter: moment().add(500, 'm').toISOString(),
  id: '_491d90a0fbf3e819b381ebde4360f77b',
  assertionId: '_7aa9fd860457e5532b9b0fc8da2c538e',
  inResponseTo: '_232f864e3823defa2bca',
  recipient: 'https://af-api-test.iteamdev.se/auth/saml/callback',
  attributes: [
    {
      name: 'pisa_id',
      format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
      value: 'bebae',
      type: 'xs:string'
    }
  ]
}

function sign (xml) {
	const sig = new SignedXml()
  const assertion = `/*[local-name()='Response']/*[local-name()='Assertion']`
  const issuer = `${assertion}/*[local-name()='Issuer']`
	sig.addReference(assertion, [
    'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
    'http://www.w3.org/2001/10/xml-exc-c14n#'
  ], 'http://www.w3.org/2000/09/xmldsig#sha1')
	sig.signingKey = privateKey
	sig.computeSignature(xml, {prefix: 'ds', location: {reference: issuer, action: 'after'}})
	return sig.getSignedXml()
}

function build () {
  const xml = xmlTemplate(data)
  return sign(xml)
}

module.exports = {build}
