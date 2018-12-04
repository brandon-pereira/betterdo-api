const express = require('express');
const url = require('url');

module.exports = app => {
    // Force /app to redirect to /app/
    app.all('/app', (req, res) => {
        res.redirect(url.resolve(process.env.SERVER_URL, 'app/'));
    });

    // Anything behind `/app/` requires authentication.
    app.use('/app/', (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.redirect(process.env.SERVER_URL);
        }
    });

    /* Initialize the routes and attach them to the api */
    app.use('/app/', express.static(process.env.APP_FOLDER, {}));
};
