require("dotenv").config();
const express = require("express");
const path = require('path');
const SWA = require('spotify-web-api-node'); //Node Spotify Wrapper
const FriendSync = require('./friendsync.js'); // Code for FriendSync feature
const app = express();
const PORT = process.env.PORT || 1337;
const HOSTNAME = '127.0.0.1';

app.use(express.static(path.join('..', 'frontend', 'build')));

var scopes = ['user-read-private', 'user-read-email'],
   clientID = process.env.SPOTIFY_CLIENT_ID,
   clientSECRET = process.env.SPOTIFY_CLIENT_SECRET,
   state = 'mikeamysyedkenny';

var spotifyApi = new SWA({
   clientId: clientID,
   clientSecret: clientSECRET,
   redirectUri: 'http://localhost:1337/api/spotifycallback'
});

var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

app.get('/api/spotify', (req, res) => {
   res.redirect(authorizeURL);
});

app.get('/api/spotifycallback', (req, res) => {
   spotifyApi.authorizationCodeGrant(req.query.code).then(
      (data) => {
         console.log('The token expires in ' + data.body['expires_in']);
         console.log('The access token is ' + data.body['access_token']);
         console.log('The refresh_token is ' + data.body['refresh_token']);
         spotifyApi.setAccessToken(data.body['access_token']);
         spotifyApi.setRefreshToken(data.body['refresh_token']);
         res.redirect('/');
      },
      (err) => {
         console.log('backend::app.js::/api/spotifycallback spotifyApi.authorizationCodeGrant failed', err);
      }
   );
});

// Endpoints for friendsync feature
app.get('/friendsync/invite/:userid', function (req, res) {
    res.send(FriendSync.invite(req.params.userid));
});

app.post('/friendsync/queue/add/:groupid&:songid', function (req, res) {
    FriendSync.add_to_queue(req.params.groupid, req.params.songid)
})

app.listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
