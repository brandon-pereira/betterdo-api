const express = require('express');
const app = express();

/**
 * Express middleware
 */
app.use(require('cookie-parser')());
app.use(require('body-parser').json({}));
app.use(require('body-parser').urlencoded({ extended: true }));

const routedApp = express.Router();
// routedApp.use('/b', user);

app.use('/betterdo', routedApp);

module.exports = routedApp;
