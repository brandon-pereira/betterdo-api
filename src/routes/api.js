const express = require('express');
const { getLists, createList, updateList, deleteList } = require('../controllers/lists');
const { getTask, createTask, updateTask, deleteTask } = require('../controllers/tasks');
const { updateUser, getCurrentUser, getUser } = require('../controllers/users');
const routeHandler = require('../helpers/routeHandler');

module.exports = (app, database, notifier) => {
    /* Initialize a router, anything behind `/api` requires authentication. */
    const api = express.Router();
    api.use('/', (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.status(401).json({
                error: 'Authentication Required'
            });
        }
    });

    /**
     * Lists
     */
    api.get(['/lists', '/lists/:listId'], (req, res) =>
        routeHandler('getting lists', { req, res, database, notifier }, config =>
            getLists(req.params.listId, {
                ...config,
                includeCompleted: Boolean(req.query.includeCompleted === 'true')
            })
        )
    );

    api.put('/lists', (req, res) =>
        routeHandler('create list', { req, res, database, notifier }, config =>
            createList(req.body, config)
        )
    );
    api.post('/lists/:listId', (req, res) =>
        routeHandler('update list', { req, res, database, notifier }, config =>
            updateList(req.params.listId, req.body, config)
        )
    );
    api.delete('/lists/:listId', (req, res) =>
        routeHandler('delete list', { req, res, database, notifier }, config =>
            deleteList(req.params.listId, config)
        )
    );

    /**
     * Tasks
     */
    api.put('/tasks', (req, res) =>
        routeHandler('adding task', { req, res, database, notifier }, config => {
            const listId = req.body.listId;
            delete req.body.listId;
            return createTask(listId, req.body, config);
        })
    );
    api.get('/tasks/:taskId', (req, res) =>
        routeHandler('getting task', { req, res, database, notifier }, config =>
            getTask(req.params.taskId, config)
        )
    );
    api.post('/tasks/:taskId', (req, res) =>
        routeHandler('updating task', { req, res, database, notifier }, config =>
            updateTask(req.params.taskId, req.body, config)
        )
    );
    api.delete('/tasks/:taskId', (req, res) =>
        routeHandler('deleting task', { req, res, database, notifier }, config =>
            deleteTask(req.params.taskId, config)
        )
    );

    /**
     * Users
     */
    api.get('/users/:email', (req, res) =>
        routeHandler('getting user by email', { req, res, database, notifier }, config =>
            getUser(req.params.email, config)
        )
    );
    api.get('/user', (req, res) =>
        routeHandler('getting current user', { req, res, database, notifier }, config =>
            getCurrentUser(config)
        )
    );
    api.post('/users', (req, res) =>
        routeHandler('updating user', { req, res, database, notifier }, config =>
            updateUser(req.body, config)
        )
    );

    /* Bind the api to the main server */
    app.use('/api', api);
};
