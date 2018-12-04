const express = require('express');
const path = require('path');

module.exports = app => {
    app.use('/', (req, res, next) => {
        if (req.path === '/' && req.user) {
            console.log('Redirect to app from root');
            res.redirect(path.join(process.env.SERVER_URL, 'app'));
        } else {
            next();
        }
    });

    app.get('/', express.static('public'));
};
