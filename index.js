require('dotenv').config();
const express = require('express');

/**
 * Instantiate the server (using express)
 */
const app = require('./src/express');

/**
 * Get a reference to the database
 */
const db = require('./src/database');

/**
 * Passport authentication middleware
 */
require('./src/passport')(app, db);

/**
 * Initialize Routes
 */
const routedApp = express.Router();
app.use('/betterdo', routedApp);

require('./src/routes/app')(routedApp, db);
require('./src/routes/api')(routedApp, db);
require('./src/routes/root')(routedApp, db);

app.listen(process.env.SERVER_PORT || 8080, () => {
    console.info('Server started on port', process.env.SERVER_PORT || 8080);
});
