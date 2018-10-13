const express = require('express');

module.exports = app => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    app.use('/', (req, res, next) => {
        if (req.user) {
            res.redirect(process.env.BASE_FOLDER + '/appsss');
        } else {
            next();
        }
    });

    app.use('/', express.static('public'));
};
