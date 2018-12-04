const express = require('express');

module.exports = app => {
    app.use('/', (req, res, next) => {
        if (req.path === '/' && req.user) {
            console.log('Redirect to app from root');
            res.redirect(`/app`);
        } else {
            next();
        }
    });

    app.get('/', express.static('public'));
};
