require('dotenv').config();

/**
 * Instantiate the server (using express)
 */
const app = require('./lib/express');

/**
 * Get a reference to the database
 */
const db = require('./lib/database');

/**
 * Passport authentication middleware
 */
require('./lib/passport')(app, db);

/**
 * Initialize Routes
 */
require('./lib/routes/app')(app);
require('./lib/routes/api')(app);
require('./lib/routes/root')(app);

app.listen(process.env.SERVER_PORT || 8080, () => {
  console.info("Server started on port", process.env.SERVER_PORT || 8080)
});
