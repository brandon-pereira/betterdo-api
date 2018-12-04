const express = require('express');
const app = express();
app.set('strict routing', true);
/**
 * Express middleware
 */
app.use(require('cookie-parser')());
app.use(require('body-parser').json({}));
app.use(require('body-parser').urlencoded({ extended: true }));

module.exports = app;
