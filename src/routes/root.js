const express = require('express');

module.exports = app => {
    app.use('/', (req, res, next) => {
        if (req.user) {
            console.log('redirect to /app from root');
            res.redirect('/app');
        } else {
            next();
        }
    });

    app.use('/', express.static('public'));
};
