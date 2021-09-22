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
import _notifier from './notifier';
const notifier = _notifier(app, db);

/**
 * Passport authentication middleware
 */
import passportMiddleware from './passport';
passportMiddleware(app, db);

/**
 * Initialize Routes
 */
const router = { app, db, notifier };
import App from './routes/app';
App(router);
import Api from './routes/api';
Api(router);
import Root from './routes/root';
Root(router);

app.listen(process.env.SERVER_PORT || 8080, () => {
    console.info('Server started on port', process.env.SERVER_PORT || 8080);
});
