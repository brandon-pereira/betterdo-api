const express = require('express');
const {
    getLists,
    createList,
    updateList,
    deleteList
} = require('../controllers/lists');
const { createTask, updateTask, deleteTask } = require('../controllers/tasks');
const routeHandler = require('../helpers/routeHandler');

module.exports = (app, database) => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    const api = express.Router();
    api.use((req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.redirect('/');
        }
    });

    /**
     * Lists
     */
    api.get(['/lists', '/lists/:listId'], (req, res) =>
        routeHandler('getting lists', { req, res, database }, config =>
            getLists(req.params.listId, config)
        )
    );
    api.put('/lists', (req, res) =>
        routeHandler('create list', { req, res, database }, config =>
            createList(req.body, config)
        )
    );
    api.post('/lists/:listId', (req, res) =>
        routeHandler('update list', { req, res, database }, config =>
            updateList(req.params.listId, req.body, config)
        )
    );
    api.delete('/lists/:listId', (req, res) =>
        routeHandler('delete list', { req, res, database }, config =>
            deleteList(req.params.listId, config)
        )
    );

    /**
     * Tasks
     */
    api.put('/tasks', (req, res) => createTask({ req, res, database }));
    api.post('/tasks/:taskId', (req, res) =>
        updateTask({ req, res, database })
    );
    api.delete('/tasks/:taskId', (req, res) =>
        deleteTask({ req, res, database })
    );

    /* Bind the api to the main server */
    app.use('/api', api);
};
