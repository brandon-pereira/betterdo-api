import { throwError } from '../helpers/errorHandler';
import { parseObjectID } from '../helpers/objectIds';
import { isCustomList, modifyTaskForCustomList } from '../helpers/customLists';
import { notifyAboutSharedList } from '../helpers/notify';

async function createTask(listId, taskObj = {}, { db, user, notifier }) {
    // Ensure list id is passed
    if (!listId) throwError('Invalid List ID');
    // If the list is a custom list, modify task with new settings
    if (isCustomList(listId)) {
        taskObj = modifyTaskForCustomList(listId, taskObj);
        listId = 'inbox';
    }
    // Ensure list exists and user has permissions
    const list = await db.Lists.getList(user._id, parseObjectID(listId));
    // If no results, throw error
    if (!list) throwError('Invalid List ID');
    // Remove potentially harmful properties
    delete taskObj.listId;
    delete taskObj.createdBy;
    delete taskObj.creationDate;
    // Attempt to create the list
    const task = await db.Tasks.create({
        ...taskObj,
        createdBy: user._id,
        list: list._id
    });
    // Add task to list
    await db.Lists.addTaskToList(task, list._id);
    // Notify about shared list task addition
    notifyAboutSharedList(`${user.firstName} added ${task.title} to ${list.title}.`, {
        notifier,
        list,
        user
    });
    // Populate task fields
    await db.Tasks.populateTask(task);
    // Return new list to front-end
    return task;
}

async function updateTask(taskId, updatedTask = {}, { db, user, notifier }) {
    let notificationSent = false;
    // Ensure list id is passed
    if (!taskId) throwError('Invalid Task ID');
    // Get task
    const task = await db.Tasks.findOne({ _id: taskId });
    // If no results, throw error
    if (!task) throwError('Invalid Task ID');
    // Get List
    let list = await db.Lists.getUserListById(user._id, task.list);
    // Ensure valid permissions
    if (!list) {
        throwError('User is not authorized to access task', 'PermissionsError');
    }
    // Code for handling change of list
    if (updatedTask.list && !task.list.equals(updatedTask.list)) {
        // Get new list
        let newList = await db.Lists.getUserListById(user._id, updatedTask.list);
        // Verify updatedTask.list is valid list
        if (!newList) {
            throwError('User is not authorized to access list', 'PermissionsError');
        }
        // Remove from this list
        await db.Lists.removeTaskFromList(task, list._id);
        // Add to new list
        await db.Lists.addTaskToList(task, newList._id);
        // Set to new list so that later code doesn't need to process
        task.list = updatedTask.list;
        list = newList;
    }
    // If the task isCompleted state changed
    if (updatedTask.isCompleted !== undefined && task.isCompleted !== updateTask.isCompleted) {
        if (updatedTask.isCompleted) {
            notificationSent = true;
            // Notify about shared list task deletion
            notifyAboutSharedList(`${user.firstName} completed ${task.title} in ${list.title}.`, {
                notifier,
                list,
                user
            });
            await db.Lists.setTaskCompleted(task._id, list._id);
        } else {
            await db.Lists.setTaskIncompleted(task._id, list._id);
        }
    }
    // Merge the tasks.. validation on the model will handle errors
    Object.assign(task, updatedTask);
    // Save the model
    await task.save();
    // Notify about shared list update
    if (!notificationSent) {
        notifyAboutSharedList(`${user.firstName} updated ${task.title} in ${list.title}.`, {
            notifier,
            list,
            user
        });
    }
    // Populate task fields
    await db.Tasks.populateTask(task);
    // Return list to front-end
    return task;
}

async function getTask(taskId, { db, user }) {
    // Ensure list id is passed
    if (!taskId) throwError('Invalid Task ID');
    // Get task
    const task = await db.Tasks.findById(taskId);
    // Ensure task id is valid
    if (!task) throwError('Invalid Task ID');
    // Get parent list
    const list = await db.Lists.getUserListById(user._id, task.list);
    // Ensure valid permissions
    if (!list) throwError('User is not authorized to access task', 'PermissionsError');
    // Populate task fields
    await db.Tasks.populateTask(task);
    // Return task to front-end
    return task;
}

async function deleteTask(taskId, { db, user, notifier }) {
    // Ensure list id is passed
    if (!taskId) throwError('Invalid Task ID');
    // Get task
    const task = await db.Tasks.findById(taskId);
    // Ensure task id is valid
    if (!task) throwError('Invalid Task ID');
    // Get parent list
    const list = await db.Lists.getUserListById(user._id, task.list);
    // Ensure valid permissions
    if (!list) throwError('User is not authorized to access task', 'PermissionsError');
    // Remove task from list
    await db.Lists.removeTaskFromList(task._id, task.list);
    // Delete task
    await db.Tasks.deleteOne({ _id: task._id });
    // Notify about shared list task deletion
    notifyAboutSharedList(`${user.firstName} deleted ${task.title} from ${list.title}.`, {
        notifier,
        list,
        user
    });
    return { success: true };
}

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    getTask
};
