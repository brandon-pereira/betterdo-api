const { throwError } = require('../helpers/errorHandler');
const { isCustomList, fetchCustomList, fetchUserCustomLists } = require('../helpers/customLists');
const mongoose = require('mongoose');

async function getLists(listId, { database, user, includeCompleted }) {
    // Get lists based on query data
    if (listId && isCustomList(listId)) {
        return await fetchCustomList(listId, includeCompleted, { database, user });
    } else if (listId) {
        let list = await database.Lists.getList(user._id, listId);
        if (!list) {
            throwError('Invalid List ID');
        }
        if (includeCompleted) {
            await list
                .populate({
                    path: 'completedTasks',
                    populate: {
                        path: 'createdBy',
                        model: 'User',
                        select: ['_id', 'firstName', 'lastName', 'profilePicture']
                    }
                })
                .execPopulate();
            list = list.toObject();
            list.additionalTasks = 0;
        }
        return list;
    } else {
        let inbox = database.Lists.getUserInbox(user._id);
        let userLists = database.Users.getLists(user._id);
        let customLists = fetchUserCustomLists({ database, user });
        [inbox, userLists, customLists] = await Promise.all([inbox, customLists, userLists]);
        return [inbox, ...userLists, ...customLists];
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
    // Add list to users array
    await database.Users.addListToUser(list._id, user);
    // Populate
    await database.Lists.populateList(list);
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
    }
    // If members list changes
    if (updatedList.members && Array.isArray(updatedList.members)) {
        const currentMembers = list.members.map(member => member._id.toString());
        updatedList.members = updatedList.members.map(member => member.toString());
        const newMembers = updatedList.members.filter(member => !currentMembers.includes(member));
        const removedMembers = currentMembers.filter(
            member => !updatedList.members.includes(member)
        );
        const addMembersPromise = Promise.all(
            newMembers.map(async member => {
                const user = await database.Users.findById(member);
                await database.Users.addListToUser(list._id, user);
            })
        );
        const removeMembersPromise = Promise.all(
            removedMembers.map(async member => {
                const user = await database.Users.findById(member);
                await database.Users.removeListFromUser(list._id, user);
            })
        );
        await Promise.all([addMembersPromise, removeMembersPromise]);
        list.members = updatedList.members;
        delete updatedList.members;
    }
    // Merge the lists.. validation on the model will handle errors
    Object.assign(list, updatedList);
    // Save the model
    await list.save();
    // Repopulate object
    await database.Lists.populateList(list);
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
        // Remove list to users array
        await database.Users.removeListFromUser(new mongoose.Types.ObjectId(listId), user);
        // Return success message
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
