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

(async () => {
    console.log('HI');
    try {
        const user = await db.Users.findOne({
            firstName: 'Brandon'
        });
        if (!user) {
            return;
        }
        const userLists = await db.Users.getLists(user._id);
        console.log(userLists);
    } catch (err) {
        console.log(err);
    }
})();
/**
 * Passport authentication middleware
 */
// import passportMiddleware from './passport';
// passportMiddleware(app, db);

/**
 * Initialize Routes
 */
//  require('./src/routes/app')(app, db);
//  require('./src/routes/api')(app, db, notifier);
//  require('./src/routes/root')(app, db);

app.listen(process.env.SERVER_PORT || 8080, () => {
    console.info('Server started on port', process.env.SERVER_PORT || 8080);
});
