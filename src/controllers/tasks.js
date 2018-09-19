const { throwError } = require('../helpers/errorHandler');

async function createTask(listId, taskObj = {}, { database, user }) {
    // Ensure list id is passed
    if (!listId) throwError('Invalid List ID');
    // Ensure list exists and user has permissions
    const list = await database.Lists.findOne({
        _id: listId,
        members: user._id
    });
    // If no results, throw error
    if (!list) throwError('Invalid List ID');
    // Remove potentially harmful properties
    delete taskObj.listId;
    delete taskObj.createdBy;
    delete taskObj.creationDate;
    // Attempt to create the list
    const task = await database.Tasks.create({
        ...taskObj,
        createdBy: user._id,
        list: listId
    });
    // TODO: Add task to list
    // list.tasks.addToSet(task._id);
    // await list.save();
    // Return new list to front-end
    return task;
}

async function updateTask(taskId, updatedTask = {}, { database, user }) {
    // Ensure list id is passed
    if (!taskId) throwError('Invalid Task ID');
    // Get task
    const task = await database.Tasks.findOne({ _id: taskId });
    // If no results, throw error
    if (!task) throwError('Invalid Task ID');
    // Get List
    const list = await database.Lists.findOne({
        _id: task.list,
        members: user._id
    });
    // Ensure valid permissions
    if (!list) {
        throwError('User is not authorized to access task', 'PermissionsError');
    }
    // TODO: What if they change task.list? We need to update list
    // TODO: Merge tasks.subtasks with req.body.subtasks
    // Merge the tasks.. validation on the model will handle errors
    Object.assign(task, updatedTask);
    // Save the model
    await task.save();
    // Return list to front-end
    return task;
}

async function deleteTask(taskId, { database, user }) {
    // Ensure list id is passed
    if (!taskId) throwError('Invalid Task ID');
    // Get task
    const task = await database.Tasks.findById(taskId);
    // Ensure task id is valid
    if (!task) throwError('Invalid Task ID');
    // Get parent list
    const list = await database.Lists.findOne({
        _id: task.list,
        members: user._id
    });
    // Ensure valid permissions
    if (!list) throwError('User is not authorized to access task', 'PermissionsError');
    // Remove task from list
    // TODO: Remove from list
    // Delete task
    const status = await database.Tasks.deleteOne({ _id: task._id });
    // Check results
    if (status && status.n > 0) {
        return { success: true };
    }
    throwError('Invalid Task ID');
}

module.exports = {
    createTask,
    updateTask,
    deleteTask
};
