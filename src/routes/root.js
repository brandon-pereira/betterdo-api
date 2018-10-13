const express = require('express');

module.exports = app => {
    app.use('/', (req, res, next) => {
        if (req.user) {
            console.log('redirect to,', process.env.BASE_FOLDER + '/app',  'from root');
            res.redirect(process.env.BASE_FOLDER + '/app');
        } else {
            next();
        }
    });

    app.use('/', express.static('public'));
};
