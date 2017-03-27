const {create} = require('./idp')
const app = create({
  serviceProvider: {
    destination: 'http://localhost:3000/auth/saml/callback',
    metadata: 'http://localhost:3000/auth/saml/metadata.xml',
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
})

app.listen(7000)
