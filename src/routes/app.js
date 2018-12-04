const express = require('express');
const url = require('url');

module.exports = app => {
    // Force /app to redirect to /app/
    app.all('/app', (req, res) => {
        console.log('Redirect /app to /app/');
        res.redirect(url.resolve(process.env.SERVER_URL, 'app/'));
    });

    // Anything behind `/app/` requires authentication.
    app.use('/app/', (req, res, next) => {
        console.log('HERE');
        if (req.user) {
            console.log('Valid /app request');
            next();
        } else {
            console.log('Redirect to root from app');
            res.redirect(process.env.SERVER_URL);
        }
    });

    /* Initialize the routes and attach them to the api */
    app.use('/app/', express.static(process.env.APP_FOLDER, {}));
};
