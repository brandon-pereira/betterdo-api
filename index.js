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
require('./lib/routes/api')(app);
// require('./routes/app')(app);
// require('./routes/index')(app);

app.listen(process.env.SERVER_PORT || 8080, () => {
  console.info("Server started on port", process.env.SERVER_PORT || 8080)
});
