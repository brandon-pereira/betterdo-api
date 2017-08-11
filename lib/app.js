const express = require('express');
const app = express();
const passport = require('./passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const db = require('./database').connection;

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({mongooseConnection: db})
}))
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect('/');
});

const api = express.Router();
api.use((req, res, next) => {
  if(req.user) {
    next();
  } else {
    res.redirect('/');
  }
})
require('./routes/lists.js')(api);
app.use('/api', api);


app.listen(process.env.port || 8080);


module.exports = app;