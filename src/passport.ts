import { Application } from 'express';
import { Database, MONGO_CONNECTION_URL } from './database';
import passport from 'passport';
import { Profile, Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import url from 'url';
interface GoogleUser {
    google_id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
}

export default (app: Application, db: Database): void => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                callbackURL: url.resolve(process.env.SERVER_URL || '', 'auth/google/callback')
            },
            async (accessToken: string, refreshToken: string, profile: Profile, cb) => {
                if (!profile) {
                    cb('AuthError');
                }
                const googleId = profile.id;

                const googleInfo = {
                    google_id: googleId,
                    firstName: profile?.name?.givenName,
                    lastName: profile?.name?.familyName,
                    email:
                        profile && profile.emails && profile.emails[0]
                            ? profile.emails[0].value
                            : 'N/A',
                    profilePicture:
                        profile && profile.photos && profile.photos[0]
                            ? profile.photos[0].value
                            : 'N/A'
                } as GoogleUser;
                let user = await db.Users.findOne({
                    google_id: googleId
                });
                if (!user) {
                    console.log('new user', googleInfo);
                    // Create User
                    user = await db.Users.create(googleInfo);
                    const inbox = new db.Lists({
                        title: 'Inbox',
                        type: 'inbox',
                        owner: user._id
                    });
                    await inbox.save();
                    return cb(null, user);
                } else {
                    // TODO: Fix this
                    // Existing user
                    const hasGoogleAccountUpdated = false;
                    // const hasGoogleAccountUpdated = Object.keys(googleInfo).find(key => {
                    //     if (googleInfo[key]) {
                    //         googleInfo[key] !== user[key];
                    //     }
                    //     return false;
                    // });
                    if (hasGoogleAccountUpdated) {
                        console.log('user info updated', hasGoogleAccountUpdated);
                        user.set(googleInfo);
                        await user.save();
                    }
                    // Now ensure all lists are valid
                    const userListCount = user.lists.length;
                    await user.populate('lists');
                    if (user.lists.length !== userListCount) {
                        user.lists = user.lists.map(list => list.id);
                        await user.save();
                    }
                    return cb(null, user);
                }
            }
        )
    );

    passport.serializeUser((user, done): void => done(null, user._id));

    passport.deserializeUser(async (_id: string, done) => {
        const user = await db.Users.findById(_id);
        if (user) {
            return done(null, user);
        }
        return done({ message: 'AuthenticationRequired' });
    });

    app.use(
        session({
            secret: process.env.SESSION_SECRET || '',
            resave: false,
            saveUninitialized: true,
            store: new MongoStore({ mongoUrl: MONGO_CONNECTION_URL }),
            cookie: {
                // sameSite: 'none',
                maxAge: 1000 * 60 * 60 * 24 * 31 * 6 // ms * sec * mins * hours * days * 6 = ~ 6 months
            }
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
        res.redirect(url.resolve(process.env.APP_URL || '', '/app'));
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
