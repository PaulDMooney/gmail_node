# Using Google APIs
Demo of some Google APIs

## Purpose
Learning project for nodejs and Oauth 2. Started with the sample code from google, and refactored to use Promise chains instead of a deep callback structure.

## Prerequisites
* node.js 4.x, npm 3.x
* `client_secret.json` file from google following the step 1 from this guide: https://developers.google.com/gmail/api/quickstart/nodejs#prerequisites

## To Run
1. Run the obligatory `npm install` from the project root.
2. Run the application with `node app.js`

## Notes
Creates and stores files under the user's home in a folder called .credentials. Note the user's home can be different when running from a typical Windows Command/Powershell environment to a Cygwin/Babun type environment.
