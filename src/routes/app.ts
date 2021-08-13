import express, { Application } from 'express';
import url from 'url';

const serverUrl = process.env.SERVER_URL || '';

export default ({ app }: { app: Application }): void => {
    // Force /app to redirect to /app/
    app.all('/app', (_, res) => {
        res.redirect(url.resolve(serverUrl || '', 'app/'));
    });

    // Anything behind `/app/` requires authentication.
    app.use('/app/', (req, res, next) => {
        console.log(req.user);
        if (req.user) {
            next();
        } else {
            res.redirect(serverUrl);
        }
    });

    /* Initialize the routes and attach them to the api */
    app.use('/app/', express.static(process.env.APP_FOLDER || '', {}));
};
