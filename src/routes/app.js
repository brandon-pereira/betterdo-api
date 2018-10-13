const express = require('express');

module.exports = app => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    const _app = express.Router();
    _app.use((req, res, next) => {
        console.log("app", req.user);
        if (!req.user) {
            res.redirect(process.env.BASE_FOLDER);
        } else {
            next();
        }
    });

    /* Initialize the routes and attach them to the api */
    _app.use('/', express.static(process.env.APP_FOLDER));

    /* Bind the api to the main server */
    app.use('/app', _app);
};
