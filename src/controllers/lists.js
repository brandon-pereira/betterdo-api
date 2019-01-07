const { throwError } = require('../helpers/errorHandler');
const { isCustomList, fetchCustomList, fetchUserCustomLists } = require('../helpers/customLists');

async function getLists(listId, { database, user, includeCompleted }) {
    // Get lists based on query data
    if (listId && isCustomList(listId)) {
        return await fetchCustomList(listId, includeCompleted, { database, user });
    } else if (listId) {
        let list = await database.Lists.getLists(user._id, listId);
        if (!list) {
            throwError('Invalid List ID');
        }
        if (includeCompleted) {
            await list.populate('completedTasks').execPopulate();
            list = list.toObject();
            list.additionalTasks = 0;
        }
        return list;
    } else {
        // all lists for user
        const userLists = await database.Lists.getLists(user._id);
        const inbox = userLists.shift();
        const customLists = await fetchUserCustomLists({ database, user });
        return [inbox, ...customLists, ...userLists];
    }
}

async function createList(listObj = {}, { database, user }) {
    // Remove potentially harmful properties
    delete listObj.owner;
    delete listObj.members;
    delete listObj.type;
    // Attempt to create the list
    const list = await database.Lists.create({
        ...listObj,
        owner: user._id
    });
    // Return new list to front-end
    return list;
}

async function updateList(listId, updatedList = {}, { database, user }) {
    // Ensure list id is passed
    if (!listId) throwError('Invalid List ID');
    // Get list
    const list = await database.Lists.getUserListById(user._id, listId);
    // If no results, throw error
    if (!list) throwError('Invalid List ID');
    // If inbox, don't allow editing some fields
    if (list.type === 'inbox') {
        updatedList = { tasks: updatedList.tasks };
    }
    // Ensure tasks length matches and no new tasks injected
    if (
        updatedList.tasks &&
        (!Array.isArray(updatedList.tasks) ||
            updatedList.tasks.length !== list.tasks.length ||
            updatedList.tasks.find(
                _id => !list.tasks.map(task => task._id.toString()).includes(_id)
            ))
    ) {
        throwError('Invalid modification of tasks');
    } else if (updatedList.tasks) {
        // Valid tasks, update order
        list.tasks = updatedList.tasks;
        // Don't merge below
        delete updatedList.tasks;
        // Update tasks obj
        await list.populate('tasks').execPopulate();
    }
    // If members list changes
    if (updatedList.members && Array.isArray(updatedList.members)) {
        list.members = updatedList.members;
        delete updatedList.members;
        await list
            .populate('members', ['_id', 'firstName', 'lastName', 'profilePicture'])
            .execPopulate();
    }
    // Merge the lists.. validation on the model will handle errors
    Object.assign(list, updatedList);
    // Save the model
    await list.save();
    // Return list to front-end
    return list;
}

async function deleteList(listId, { database, user }) {
    // Ensure list id is passed
    if (!listId) throwError('Invalid List ID');
    // Get list
    const status = await database.Lists.deleteOne({
        _id: listId,
        members: user._id,
        type: 'default'
    });
    if (status && status.n > 0) {
        return { success: true };
    }
    throwError('Invalid List ID');
}

module.exports = {
    getLists,
    createList,
    updateList,
    deleteList
};
