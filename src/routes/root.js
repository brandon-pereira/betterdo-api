const express = require('express');

module.exports = app => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    app.use('/', (req, res, next) => {
        if (req.user) {
            res.redirect(req.baseUrl + '/app');
        } else {
            next();
        }
    });

    app.use('/', express.static('public'));
};
