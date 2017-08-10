const express = require('express');
const db = require('./lib/database');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
require('dotenv').config();

// const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/google/callback"
}, (accessToken, refreshToken, profile, cb) => {
  db.User.findOrCreate(profile.id, {
    google_id: profile.id,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName
  }, (err, user) => cb(err, user))
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  db.User.findOne({_id: id}, (err, obj) => done(err, obj.toJSON()));
});

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json(Object.assign({hello: 'world'}, req.user));
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect('/');
});

app.listen(8080);

// require('./lib/routes/lists.js')(app);
