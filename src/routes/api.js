const express = require('express');
const init = require('../controllers/init');
const { getLists, createList, updateList, deleteList } = require('../controllers/lists');
const { createTask, updateTask, deleteTask } = require('../controllers/tasks');
const routeHandler = require('../helpers/routeHandler');

module.exports = (app, database) => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    const api = express.Router();
    api.use('/', (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.status(401).json({
                error: 'Authentication Required'
            })
        }
    });

    /**
     * Init
     */
    api.get(['/init', '/init/:listId'], (req, res) =>
        routeHandler('getting initial payload', { req, res, database }, config =>
            init(req.params.listId, config)
        )
    );

    /**
     * Lists
     */
    api.get(['/lists', '/lists/:listId'], (req, res) =>
        routeHandler('getting lists', { req, res, database }, config =>
            getLists(req.params.listId, {
                ...config,
                includeCompleted: Boolean(req.query.includeCompleted === 'true')
            })
        )
    );

    api.put('/lists', (req, res) =>
        routeHandler('create list', { req, res, database }, config => createList(req.body, config))
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
    api.put('/tasks', (req, res) =>
        routeHandler('adding task', { req, res, database }, config =>
            createTask(req.body.listId, req.body, config)
        )
    );
    api.post('/tasks/:taskId', (req, res) =>
        routeHandler('updating task', { req, res, database }, config =>
            updateTask(req.params.taskId, req.body, config)
        )
    );
    api.delete('/tasks/:taskId', (req, res) =>
        routeHandler('deleting task', { req, res, database }, config =>
            deleteTask(req.params.taskId, config)
        )
    );

    /* Bind the api to the main server */
    app.use('/api', api);
};
