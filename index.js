require('dotenv').config();

/**
 * Instantiate the server (using express)
 */
const app = require('./src/express');

/**
 * Get a reference to the database
 */
const db = require('./src/database');

/**
 * Get a reference to pushnotifier
 */
const notifier = require('./src/notifier')(app, db);

/**
 * Passport authentication middleware
 */
require('./src/passport')(app, db);

/**
 * Initialize Routes
 */
require('./src/routes/app')(app, db);
require('./src/routes/api')(app, db, notifier);
require('./src/routes/root')(app, db);

app.listen(process.env.SERVER_PORT || 8080, () => {
    console.info('Server started on port', process.env.SERVER_PORT || 8080);
});
