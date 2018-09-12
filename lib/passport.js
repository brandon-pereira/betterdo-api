const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

module.exports = (app, db) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.SERVER_URL + '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, cb) => {
    const user = await db.Users.findOrCreate(profile.id, {
      google_id: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName
    });
    cb(null, user);
  }));

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await db.Users.findOne({_id: id})
    done(null, user.toJSON());
  });

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: db.connection })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
  app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    res.redirect(req.header("referrer")); // Redirect /tv-tracker/auth/google to /tv-tracker
  });
  app.get("/auth/logout", (req, res) => {
    req.logout();
    res.redirect(req.header("referrer")); // Redirect /tv-tracker/auth/google to /tv-tracker
  });
}