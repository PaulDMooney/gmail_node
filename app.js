var fs = require('fs');
var GmailAPI = require('./modules/gmailapi');
var q = require('q');
var express = require('express');
var rawBodyParser = require('raw-body-parser');

var app = express();
app.use(rawBodyParser());

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';

var gmailAPI = new GmailAPI(TOKEN_DIR, SCOPES);

var readClientSecret = q.nfcall(fs.readFile, 'client_secret.json')
  .then(content => {
    console.log("Client secret: " + content);
    return Promise.resolve(JSON.parse(content))
  });

app.get('/', function(req, res) {

  var authorizedAccess = readClientSecret.then(
    credentials => gmailAPI.authorize(credentials).catch(err => {
      res.send('Authorize this app by visiting this url: ' + gmailAPI.generateOfflineAuthUrl(err.oauth2Client)
        + '\n Post back the code to this URL in a raw body.');
    })
  );

  authorizedAccess.then(auth => gmailAPI.getLabels(auth))
      .then(response => {
        res.send(response[1].body.labels);
      })
      .catch(err => {
        res.send(err.message + '\n' + err.stack)
      });

});

app.get('/ping', function(req, res) {
  res.send('pong');
});

app.post('/', function(req, res) {
  var code = req.rawBody.toString('utf8');
  readClientSecret.then(credentials => {
      var oauth2Client = gmailAPI.setupOauth2Client(credentials);
      return gmailAPI.retrieveAndStoreToken(code,oauth2Client);
    })
    .then(res.send('Thanks'));
})

app.listen(3000);
