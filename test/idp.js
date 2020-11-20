const chai = require('chai')
const expect = chai.expect
const { stub } = require('sinon')
const proxyquire = require('proxyquire')
const { readFileSync } = require('fs')
const { deflateRawSync } = require('zlib')
chai.use(require('sinon-chai'))

describe('idp', () => {
  describe('#create', () => {
    let idp, options, app, ip
    beforeEach(() => {
      app = {
        set: stub(),
        use: stub(),
        get: stub(),
        post: stub(),
        listen: stub()
      }
      ip = {
        address: stub().returns('192.168.1.1')
      }

      options = {
        serviceProvider: {
          destination: 'http://localhost:3000/auth/saml/callback',
          metadata: 'http://localhost:3000/auth/saml/metadata.xml'
        },
        users: [
          {
            id: 'bebae',
            username: 'bebae',
            password: 'pwd',
            attributes: {
              pisa_id: {
                format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
                value: 'bebae',
                type: 'xs:string'
              }
            }
          }
        ]
      }
      const { create } = proxyquire(`${process.cwd()}/lib/idp`, {
        express: stub().returns(app),
        ip: ip
      })

      idp = create(options).listen(7000)
    })
    it('creates the correct serviceProvider options', () => {
      expect(idp.options.serviceProvider)
        .to.eql({
          destination: 'http://localhost:3000/auth/saml/callback',
          metadata: 'http://localhost:3000/auth/saml/metadata.xml',
          binding: 'HTTP-POST'
        })
      expect(idp.options.spNameQualifier)
        .to.equal('http://localhost:3000/auth/saml/metadata.xml')
      expect(idp.options.audience)
        .to.equal('http://localhost:3000/auth/saml/metadata.xml')
    })
    it('creates the correct idp options', () => {
      expect(idp.options.id, 'id')
        .to.equal('_deda79ba6d9303707d45021118133cd7')
      expect(idp.options.host, 'host')
        .to.equal('http://localhost:7000')
      expect(idp.options.entity, 'entity')
        .to.equal('http://localhost:7000/idp')
      expect(idp.options.nameQualifier, 'nameQualifier')
        .to.equal('http://localhost:7000/idp')
      expect(idp.options.address)
        .to.equal('192.168.1.1')
    })
    describe('request', () => {
      let authnRequest, req, res, sso
      beforeEach(() => {
        authnRequest = {
          SAMLRequest: deflateRawSync(readFileSync(`${__dirname}/examples/authnrequest.xml`)),
          SigAlg: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
          Signature: 'someSignatureValue'
        }
        req = {
          query: authnRequest,
          session: {
            save: stub()
          }
        }
        res = {
          status: stub(),
          render: stub()
        }
        res.status.returns(res)
        sso = app.get.withArgs('/sso').firstCall.args[1]
      })
      it('renders login page if no user in session', () => {
        return sso(req, res)
          .then(() => {
            expect(res.render)
              .calledOnce
              .calledWith('login')
          })
      })
      it('renders postback if user in session', () => {
        req.session.user = {
          id: 'abc123',
          attributes: []
        }

        return sso(req, res)
          .then(() => {
            expect(res.render)
              .calledOnce
              .calledWith('postResponse')
          })
      })
      it('relayste in request', () => {
        req.session.user = {
          id: 'abc123',
          attributes: []
        }
        req.query.RelayState = 'mypath/view/1'

        return sso(req, res)
          .then(() => {
            expect(res.render.args[0][1].relayState)
              .to.equal('mypath/view/1')
          })
      })
    })
  })
})
