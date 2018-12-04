const express = require('express');

module.exports = app => {
    app.use('/', (req, res, next) => {
        if (req.path === '/' && req.user) {
            res.redirect(`${process.env.SERVER_URL}/app`);
        } else {
            next();
        }
    });

    app.get('/', express.static('public'));
};
