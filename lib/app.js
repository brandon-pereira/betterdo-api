const express = require('express');
const app = express();
const passport = require('./passport');
// const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect('/');
});

app.listen(process.env.port || 8080);

// require('./lib/routes/lists.js')(app);

module.exports = app;