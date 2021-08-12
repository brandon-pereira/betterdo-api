import { App, Database, User } from './types';

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const url = require('url');

interface GoogleUser {
    google_id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
}

export default (app: App, db: Database) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: url.resolve(process.env.SERVER_URL, 'auth/google/callback')
            },
            async (accessToken: string, refreshToken: string, profile: any, cb: Function) => {
                const googleId = profile.id;
                const googleInfo = {
                    google_id: googleId,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value
                } as GoogleUser;
                let user = await db.Users.findOne({
                    google_id: googleId
                });
                if (!user) {
                    console.log('new user', googleInfo);
                    // Create User
                    user = await db.Users.create(googleInfo);
                    await db.Lists.create({
                        title: 'Inbox',
                        type: 'inbox',
                        owner: user.id
                    });
                    return cb(null, user);
                } else {
                    // TODO: Fix this
                    // Existing user
                    const hasGoogleAccountUpdated = Object.keys(googleInfo).find(key => {
                        // if (googleInfo[key]) {
                        //     googleInfo[key] !== user[key];
                        // }
                        return false;
                    });
                    if (hasGoogleAccountUpdated) {
                        console.log('user info updated', hasGoogleAccountUpdated);
                        user.set(googleInfo);
                        await user.save();
                    }
                    // Now ensure all lists are valid
                    const userListCount = user.lists.length;
                    await user.populate('lists').execPopulate();
                    if (user.lists.length !== userListCount) {
                        user.lists = user.lists.map(list => list.id);
                        await user.save();
                    }
                    return cb(null, user);
                }
            }
        )
    );

    passport.serializeUser((user: User, done: Function) => done(null, user.id));

    passport.deserializeUser(async (id: string, done: Function) => {
        const user = await db.Users.findOne({ _id: id });
        if (user) {
            return done(null, user);
        }
        return done(null, null, { message: 'AuthenticationRequired' });
    });

    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            store: new MongoStore({ mongooseConnection: db.connection }),
            sameSite: 'none',
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 31 * 6 // ms * sec * mins * hours * days * 6 = ~ 6 months
            }
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
        res.redirect(url.resolve(process.env.APP_URL, '/app'));
    });
    app.get('/auth/logout', (req, res) => {
        req.logout();
        const referrer = req.header('referrer');
        if (referrer) {
            res.redirect(referrer);
        } else {
            res.redirect(process.env.SERVER_URL || '');
        }
    });
};
