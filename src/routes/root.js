const express = require('express');

module.exports = app => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    app.use('/', (req, res, next) => {
        console.log("HERE", req.baseUrl, req.url, req.mount);
        if (req.user) {
            res.redirect('app');
        } else {
            next();
        }
    });

    app.use('/', express.static('public'));
};
