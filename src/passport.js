const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const url = require('url');

module.exports = (app, db) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: url.resolve(process.env.SERVER_URL, 'auth/google/callback')
            },
            async (accessToken, refreshToken, profile, cb) => {
                const googleId = profile.id;
                const googleInfo = {
                    google_id: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value
                };
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
                        owner: user._id
                    });
                    return cb(null, user);
                } else {
                    // Existing user
                    const hasGoogleAccountUpdated = Object.keys(googleInfo).find(
                        key => googleInfo[key] !== user[key]
                    );
                    if (hasGoogleAccountUpdated) {
                        console.log('user info updated', hasGoogleAccountUpdated);
                        user.set(googleInfo);
                        await user.save();
                    }
                    return cb(null, user);
                }
            }
        )
    );

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
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
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 31 * 6 // ms * sec * mins * hours * days * 6 = ~ 6 months
            }
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
        res.redirect(url.resolve(process.env.SERVER_URL, 'app/'));
    });
    app.get('/auth/logout', (req, res) => {
        req.logout();
        if (req.header('referrer')) {
            res.redirect(req.header('referrer'));
        } else {
            res.redirect(process.env.SERVER_URL);
        }
    });
};
