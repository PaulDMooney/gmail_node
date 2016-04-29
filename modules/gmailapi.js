"use strict"

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var q = require('q');

class GmailAPI {

	constructor(tokendir, scopes) {

		this.tokendir = tokendir;

		this.tokenpath = tokendir + 'gmail-nodejs-quickstart.json'

		this.scopes = scopes;
	}

	/**
	 * Create an OAuth2 client with the given credentials, and then execute the
	 * given callback function.
	 *
	 * @param {Object} credentials The authorization client credentials.
	 * @param {function} callback The callback to call with the authorized client.
	 * @return {Object} Promise which tries to resolve to a populated auth.OAuth2 object
	 */
	authorize(credentials) {

	  var oauth2Client = this.setupOauth2Client(credentials);

	  // Check if we have previously stored a token.
		return q.nfcall(fs.readFile, this.tokenpath, 'UTF-8')
			.then(
					token => {
						oauth2Client.credentials = JSON.parse(token);
						return new Promise(function(resolve, reject) {
									resolve(oauth2Client);
							});
					},
					err => {
						var toThrow =  new Error("No token exists");
						toThrow.oauth2Client = oauth2Client;
						throw toThrow;
					}
				);
	}

	/**
		* returns an auth.OAuth2 Object
		*/
	setupOauth2Client(credentials) {
		var clientSecret = credentials.installed.client_secret;
	  var clientId = credentials.installed.client_id;
	  var redirectUrl = credentials.installed.redirect_uris[0];
	  var auth = new googleAuth();
	  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
		return oauth2Client;
	}

	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 *
	 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback to call with the authorized
	 *     client.
	 */
	getNewToken(oauth2Client) {

		let parent = this;
		var authUrl = this.generateOfflineAuthUrl(oauth2Client);

		return this.promptForCode(authUrl)
			.then(code => {
				console.log(code);
				return parent.retrieveAndStoreToken(code, oauth2Client);
			});
	}

	generateOfflineAuthUrl(oauth2Client) {
		var authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: this.scopes
		});
		return authUrl;
	}

	promptForCode(authUrl) {
		console.log('Authorize this app by visiting this url: ', authUrl);
		var prompt = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		var promptForCodePromise = new Promise(function(resolve, reject) {
			prompt.question('Enter the code from that page here: ', function(code) {
				prompt.close();
				resolve(code);
			});
		})

		return promptForCodePromise;
	}

	retrieveAndStoreToken(code, oauth2Client) {
		console.log('Entering retreive token');
		var deferred = q.defer();
		let parent = this;
		oauth2Client.getToken(code, function(err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				deferred.reject(new Error(err));
			} else {
				oauth2Client.credentials = token;
				parent.storeToken(token);
				deferred.resolve(oauth2Client);
			}
		});
		return deferred.promise;
	}


	/**
	 * Store token to disk be used in later program executions.
	 *
	 * @param {Object} token The token to store to disk.
	 */
	storeToken(token) {
	  try {
	    fs.mkdirSync(this.tokendir);
	  } catch (err) {
	    if (err.code != 'EEXIST') {
	      throw err;
	    }
	  }
	  fs.writeFile(this.tokenpath, JSON.stringify(token));
	  console.log('Token stored to ' + this.tokenpath);
	}

	/**
	 * Lists the labels in the user's account.
	 *
	 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
	 */
	listLabels(auth) {


		return this.getLabels(auth)
		.then(response => {
			var incomingMessage = response[1];
			var labels = incomingMessage.body.labels;
			// var labels = response.labels;
	    if (labels.length == 0) {
	      console.log('No labels found.');
	    } else {
	      console.log('Labels:');
	      for (var i = 0; i < labels.length; i++) {
	        var label = labels[i];
	        console.log('- %s', label.name);
	      }
	    }
		});
	}

	getLabels(auth) {
		var gmail = google.gmail('v1');
		return q.denodeify(gmail.users.labels.list)({
	    auth: auth,
	    userId: 'me',
	  });
	}

	getProfile(auth) {
		 var gmail = google.gmail('v1');

		return q.denodeify(gmail.users.getProfile)({
	    auth: auth,
	    userId: 'me',
	  }).then(response => {
			var incomingMessage = response[1];
			var body = incomingMessage.body;
			console.log('Profile: ' + body.emailAddress);
		});
	}
}

module.exports = GmailAPI;
