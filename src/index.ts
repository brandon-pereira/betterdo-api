import 'dotenv/config';

/**
 * Instantiate the server (using express)
 */
import app from './express';

/**
 * Get a reference to the database
 */
import db from './database';

/**
 * Get a reference to notifier
 */
// import _notifier from './notifier';
// const notifier = _notifier(app, db);

/**
 * Passport authentication middleware
 */
import passportMiddleware from './passport';
passportMiddleware(app, db);

/**
 * Initialize Routes
 */
require('./routes/app').default({ app, db });
require('./routes/api').default({ app, db });
require('./routes/root').default({ app, db });

app.listen(process.env.SERVER_PORT || 8080, () => {
    console.info('Server started on port', process.env.SERVER_PORT || 8080);
});
