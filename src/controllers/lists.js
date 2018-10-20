const { throwError } = require('../helpers/errorHandler');
const { fetchHighPriority, fetchToday, fetchTomorrow } = require('../helpers/customLists');
async function getLists(listId, { database, user }) {
    // Get lists based on query data
    let lists = [];
    if (listId === 'high-priority') {
        lists = await fetchHighPriority({ database, user });
    } else if (listId === 'today') {
        lists = await fetchToday({ user, database });
    } else if (listId === 'tomorrow') {
        lists = await fetchTomorrow({ user, database });
    } else {
        lists = await database.Lists.getLists(user._id, listId);
    }
    // return appropriate results
    if (listId && lists) {
        // specific list
        return lists;
    } else if (listId) {
        // specific list but no results
        throwError('Invalid List ID');
    } else {
        // all lists for user
        return { lists };
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
    // If inbox, don't allow editing
    if (list.type === 'inbox') throwError(`Unable to modify inbox.`);
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
