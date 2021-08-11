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
        const userLists = await user.getLists();

        // console.log(userLists);
        console.log(userLists[0].id);
        // const list = await db.Lists.getList(user.id, userLists[0].id);
        const inbox = await db.Lists.getList(user.id, 'inbox');
        console.log(inbox);
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
