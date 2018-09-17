const { throwError } = require('../helpers/errorHandler');

async function getLists(listId, { database, user }) {
    // TODO: What about 'inbox', 'high-priority', 'today', 'tomorrow', etc.
    // TODO: Unit tests for this stuff?
    // Get lists based on query data
    const lists = await database.Lists.getLists(user._id, listId);
    // return appropriate results
    if (listId && Array.isArray(lists) && lists.length) {
        // specific list
        return { list: lists[0] };
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
    return { list };
}

async function updateList(listId, updatedList = {}, { database, user }) {
    // Ensure list id is passed
    if (!listId) throwError('Invalid List ID');
    // Get list
    const list = await database.Lists.findOne({
        _id: listId,
        members: user._id
    });
    // If no results, throw error
    if (!list) throwError('Invalid List ID');
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
        members: user._id
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
