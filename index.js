require('dotenv').config();

const app = require('./lib/app');
const express = require('express');

app.use('/', (req, res, next) => {
  if(req.user) {
    res.redirect('/app');
  } else {
    next();
  }
}, express.static('./node_modules/betterdo-ui/dist'))

require('./lib/routes/lists.js')(app);
