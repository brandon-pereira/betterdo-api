const express = require('express');

module.exports = app => {
    /* Initialize a router, anything behind `/app` requires authentication. */
    app.use('/app', (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.redirect(process.env.SERVER_URL);
        }
    });

    /* Initialize the routes and attach them to the api */
    app.use('/app', express.static(process.env.APP_FOLDER, {}));
};
