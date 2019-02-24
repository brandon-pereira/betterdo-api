const { throwError } = require('../helpers/errorHandler');
const { isCustomList, modifyTaskForCustomList } = require('../helpers/customLists');

async function createTask(listId, taskObj = {}, { database, user }) {
    // Ensure list id is passed
    if (!listId) throwError('Invalid List ID');
    // If the list is a custom list, modify task with new settings
    if (isCustomList(listId)) {
        taskObj = modifyTaskForCustomList(listId, taskObj);
        listId = 'inbox';
    }
    // Ensure list exists and user has permissions
    const list = await database.Lists.getLists(user._id, listId);
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
        list: list._id
    });
    // Add task to list
    await database.Lists.addTaskToList(task, list._id);
    // Populate task fields
    await database.Tasks.populateTask(task);
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
    let list = await database.Lists.getUserListById(user._id, task.list);
    // Ensure valid permissions
    if (!list) {
        throwError('User is not authorized to access task', 'PermissionsError');
    }
    // Code for handling change of list
    if (updatedTask.list && task.list.toString() !== updatedTask.list) {
        // Get new list
        let newList = await database.Lists.getUserListById(user._id, updatedTask.list);
        // Verify updatedTask.list is valid list
        if (!newList) {
            throwError('User is not authorized to access list', 'PermissionsError');
        }
        // Remove from this list
        await database.Lists.removeTaskFromList(task, list._id);
        // Add to new list
        await database.Lists.addTaskToList(task, newList._id);
        // Set to new list so that later code doesn't need to process
        task.list = updatedTask.list;
        list = newList;
    }
    // If the task isCompleted state changed
    if (updatedTask.isCompleted !== undefined && task.isCompleted !== updateTask.isCompleted) {
        if (updatedTask.isCompleted) {
            await database.Lists.setTaskCompleted(task._id, list._id);
        } else {
            await database.Lists.setTaskIncompleted(task._id, list._id);
        }
    }
    // TODO: Merge tasks.subtasks with req.body.subtasks
    // Merge the tasks.. validation on the model will handle errors
    Object.assign(task, updatedTask);
    // Save the model
    await task.save();
    // Populate task fields
    await database.Tasks.populateTask(task);
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
    const list = await database.Lists.getUserListById(user._id, task.list);
    // Ensure valid permissions
    if (!list) throwError('User is not authorized to access task', 'PermissionsError');
    // Remove task from list
    await database.Lists.removeTaskFromList(task._id, task.list);
    // Delete task
    await database.Tasks.deleteOne({ _id: task._id });
    return { success: true };
}

module.exports = {
    createTask,
    updateTask,
    deleteTask
};
