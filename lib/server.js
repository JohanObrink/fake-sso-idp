const express = require('express')
const app = express()

const {build} = require('./auth-response')

app.get('/', function(req, res){
  res
    .status(200)
    .set('Content-Type', 'application/xml')
    .send(build())
})
app.get('/base64', function(req, res){
  res
    .status(200)
    .set('Content-Type', 'text/plain')
    .send(Buffer.from(build(), 'utf8').toString('base64'))
})

app.listen(7000)
