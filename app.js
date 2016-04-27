var fs = require('fs');
var GmailAPI = require('./modules/gmailapi');
var q = require('q');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';


var gmailAPI = new GmailAPI(TOKEN_DIR, SCOPES);

// Load client secrets from a local file.
var authorize = q.nfcall(fs.readFile, 'client_secret.json')
  .then(content => gmailAPI.authorize(JSON.parse(content)),
        err => {console.log('Error loading client secret file: ' + err); throw new Error("Unable to continue without client secret file");});
 
 authorize.then(gmailAPI.listLabels);
 console.log("List Labels Setup");
 authorize.then(gmailAPI.getProfile);
 console.log("Show Profile Setup");
  // .then(gmailAPI.listLabels)
  // .then(gmailAPI.getProfile)
  // .catch(err => {console.log(err.message + '\n' + err.stack)});