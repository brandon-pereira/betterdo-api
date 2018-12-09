const express = require('express');
const url = require('url');

module.exports = app => {
    app.use('/', (req, res, next) => {
        if (req.path === '/' && req.user) {
            res.redirect(url.resolve(process.env.SERVER_URL, 'app'));
        } else {
            next();
        }
    });

    app.get('/', express.static(process.env.LANDING_FOLDER));
};
