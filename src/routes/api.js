const express = require('express');
const { getLists, createList, updateList } = require('../controllers/lists');
const { getTask, createTask } = require('../controllers/tasks');

module.exports = (app, database) => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    const api = express.Router();
    api.use((req, res, next) => {
      if(req.user) {
        next();
      } else {
        res.redirect('/');
      }
    });

    /**
     * Lists
     */
    api.get(['/lists', '/lists/:listId'], (req, res) => getLists({ req, res, database }));
    api.put('/lists', (req, res) => createList({ req, res, database }));
    api.post('/lists/:listId', (req, res) => updateList({ req, res, database }));

    /**
     * Tasks
     */
    api.get('/tasks/:taskId', (req, res) => getTask({ req, res, database }));
    api.put('/tasks', (req, res) => createTask({ req, res, database }));
    // api.post('/tasks', (req, res) => updateTask({ req, res, database }));

    /* Bind the api to the main server */
    app.use('/api', api);
}