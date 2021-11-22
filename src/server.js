'use strict';

const express = require('express');
const fs = require('fs');
const https = require('https');
const privateKey  = fs.readFileSync('/etc/ssl/private/sdebruin.nl.pem', 'utf8');
const certificate = fs.readFileSync('/etc/ssl/certs/sdebruin.nl.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate};
const app = express();

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443);

// App
app.get('/', (req, res) => {
  res.send('Hello World2');
});