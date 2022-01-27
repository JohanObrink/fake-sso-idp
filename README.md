# In this fork fake-sso-idp
A test implementation of a SAML SSO IDP 
with support of RelayState parameter.

## Install

```bash
npm install fake-sso-idp
```

## Use

To set up a server on http://localhost:7000 which answers Authn requests from
http://localhost:3000:

```js
const { create } = require('fake-sso-idp')
const app = create({
  serviceProvider: {
    destination: 'http://localhost:3000/auth/saml/callback',
    metadata: 'http://localhost:3000/auth/saml/metadata.xml'
  },
  users: [
    {
      id: 'test1',
      name: 'Test user 1',
      username: 'test1',
      password: 'pwd',
      attributes: {
        pisa_id: {
          format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
          value: 'test1',
          type: 'xs:string'
        }
      }
    },
    {
      id: 'fubar',
      name: 'Test user 2',
      username: 'fubar',
      password: 'pwd',
      attributes: {
        pisa_id: {
          format: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
          value: 'fubar',
          type: 'xs:string'
        }
      }
    }
  ]
})

app.listen(7000)
````

Simplests cases work for inbound `HTTP-REDIRECT` and outbound `HTTP-POST`

The added users will show up as login options. Logins are stored in session. To login/logout
without authn request, go to `/`
