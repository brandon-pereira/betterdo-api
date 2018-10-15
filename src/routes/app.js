const express = require('express');

module.exports = app => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    // const _app = express.Router();
    app.use('/app', (req, res, next) => {
        console.log("app", req.user);
        if (req.user) {
            next();
        } else {
            res.redirect('../');
        }
    });

    /* Initialize the routes and attach them to the api */
    app.use('/app', express.static(process.env.APP_FOLDER, {
        // fallthrough: false,
        // redirect: false
    }));

    /* Bind the api to the main server */
    // app.use('/app', _app);
};
