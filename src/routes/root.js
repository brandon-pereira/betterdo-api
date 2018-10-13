const express = require('express');

module.exports = app => {
    app.use('/', (req, res, next) => {
        if (req.user) {
            res.redirect('/app');
        } else {
            next();
        }
    });

    app.use('/', express.static('public'));
};
