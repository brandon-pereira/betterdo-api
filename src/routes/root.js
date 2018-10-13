const express = require('express');

module.exports = app => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    app.use('/', (req, res, next) => {
        console.log("root", req.user);
        if (req.user) {
            res.redirect(process.env.BASE_FOLDER + '/app');
        } else {
            next();
        }
    });

    app.use('/', express.static('public'));
};
