const express = require('express');
const path = require('path');
console.log(path.join(process.env.SERVER_URL, 'app'));
module.exports = app => {
    app.use('/', (req, res, next) => {
        if (req.path === '/' && req.user) {
            console.log('Redirect to app from root');
            res.redirect(`${process.env.SERVER_URL}'app`);
        } else {
            next();
        }
    });

    app.get('/', express.static('public'));
};
