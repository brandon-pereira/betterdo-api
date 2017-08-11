const db = require('./database');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/auth/google/callback"
}, (accessToken, refreshToken, profile, cb) => {
  db.Users.findOrCreate(profile.id, {
    google_id: profile.id,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName
  }, (err, user) => cb(err, user))
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  db.Users.findOne({_id: id}, (err, obj) => done(err, obj.toJSON()));
});

module.exports = passport;