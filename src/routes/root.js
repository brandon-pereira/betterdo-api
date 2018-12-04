const express = require('express');

module.exports = app => {
    app.get('/', (req, res, next) => {
        if (req.user) {
            res.redirect(`${process.env.SERVER_ROOT}app`);
        } else {
            next();
        }
    });

    app.get('/', express.static('public'));
};
