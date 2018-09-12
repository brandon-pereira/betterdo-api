const express = require('express');

module.exports = (app) => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    const api = express.Router();
    api.use((req, res, next) => {
      if(req.user) {
        next();
      } else {
        res.redirect('/');
      }
    });

    /* Initialize the routes and attach them to the api */
    require('./routes/lists')(api);

    /* Bind the api to the main server */
    app.use('/api', api);
}