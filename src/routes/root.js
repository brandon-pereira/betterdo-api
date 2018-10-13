const express = require('express');

module.exports = app => {
    app.get('/', (req, res, next) => {
        if (req.user) {
            console.log('redirect to', process.env.BASE_FOLDER + '/app',  'from root');
            res.redirect('/betterdo/apps');
        } else {
            next();
        }
    });

    app.get('/', express.static('public'));
};
