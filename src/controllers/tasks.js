const { handleUncaughtError, throwError } = require('./helpers');

async function createTask({ req, res, database }) {
    const userId = req.user._id;
    const listId = req.body.listId;
    try {
        // Ensure list id is passed
        if (!listId) throwError('Invalid List ID');
        // Ensure list exists and user has permissions
        const list = await database.Lists.findOne({
            _id: listId,
            members: userId
        });
        // If no results, throw error
        if (!list) throwError('Invalid List ID');
        // Remove potentially harmful properties
        delete req.body.listId;
        delete req.body.createdBy;
        delete req.body.creationDate;
        // Attempt to create the list
        const task = await database.Tasks.create({
            ...req.body,
            createdBy: userId,
            list: listId
        });
        // Add task to list
        list.tasks.addToSet(task._id);
        await list.save();
        // Return new list to front-end
        res.json({ task });
    } catch (err) {
        handleUncaughtError('creating task', res, err);
    }
}

async function updateTask({ req, res, database }) {
    const taskId = req.params.taskId;
    const userId = req.user._id;
    try {
        // Ensure list id is passed
        if (!taskId) throwError('Invalid Task ID');
        // Get task
        const task = await database.Tasks.findOne({ _id: taskId });
        // If no results, throw error
        if (!task) throwError('Invalid Task ID');
        // Ensure valid permissions
        if (await database.Lists.findOne({ _id: task._id, members: userId })) {
            throwError(
                'User is not authorized to access task',
                'PermissionsError'
            );
        }
        // TODO: What if they change task.list? We need to update list
        // TODO: Merge tasks.subtasks with req.body.subtasks
        // Merge the tasks.. validation on the model will handle errors
        Object.assign(task, req.body);
        // Save the model
        await task.save();
        // Return list to front-end
        res.json(task);
    } catch (err) {
        handleUncaughtError('updating task', res, err);
    }
}

async function deleteTask({ req, res, database }) {
    const taskId = req.params.taskId;
    const userId = req.user._id;
    try {
        // Ensure list id is passed
        if (!taskId) throwError('Invalid Task ID');
        // Get task
        const task = await database.Tasks.findById(taskId);
        // Ensure task id is valid
        if (!task) throwError('Invalid Task ID');
        // Get parent list
        const list = await database.Lists.findOne({
            _id: task.list,
            members: userId
        });
        // Ensure valid permissions
        if (!list)
            throwError(
                'User is not authorized to access task',
                'PermissionsError'
            );
        // Remove task from list
        // TODO: Remove from list
        // Delete task
        const status = await database.Tasks.deleteOne({ _id: task._id });
        // Check results
        if (status && status.n > 0) {
            return res.json({ success: true });
        }
        throwError('Invalid Task ID');
    } catch (err) {
        handleUncaughtError('deleting task', res, err);
    }
}

module.exports = {
    createTask,
    updateTask,
    deleteTask
};
