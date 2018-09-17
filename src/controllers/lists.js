const { handleUncaughtError, throwError } = require('./helpers');

async function getLists(listId, userId, { database }) {
    // TODO: What about 'inbox', 'high-priority', 'today', 'tomorrow', etc.
    // TODO: Unit tests for this stuff?
    // Get lists based on query data
    const lists = await database.Lists.getLists(userId, listId);
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

async function createList({ req, res, database }) {
    const owner = req.user._id;
    try {
        // Remove potentially harmful properties
        delete req.body.owner;
        delete req.body.members;
        delete req.body.type;
        // Attempt to create the list
        const list = await database.Lists.create({ ...req.body, owner });
        // Return new list to front-end
        res.json({ list });
    } catch (err) {
        handleUncaughtError('creating list', res, err);
    }
}

async function updateList({ req, res, database }) {
    const listId = req.params.listId;
    const userId = req.user._id;
    try {
        // Ensure list id is passed
        if (!listId) throwError('Invalid List ID');
        // Get list
        const list = await database.Lists.findOne({
            _id: listId,
            members: userId
        });
        // If no results, throw error
        if (!list) throwError('Invalid List ID');
        // Merge the lists.. validation on the model will handle errors
        Object.assign(list, req.body);
        // Save the model
        await list.save();
        // Return list to front-end
        res.json(list);
    } catch (err) {
        handleUncaughtError('updating list', res, err);
    }
}

async function deleteList({ req, res, database }) {
    const listId = req.params.listId;
    const userId = req.user._id;
    try {
        // Ensure list id is passed
        if (!listId) throwError('Invalid List ID');
        // Get list
        const status = await database.Lists.deleteOne({
            _id: listId,
            members: userId
        });
        if (status && status.n > 0) {
            return res.json({ success: true });
        }
        throwError('Invalid List ID');
    } catch (err) {
        handleUncaughtError('deleting list', res, err);
    }
}

module.exports = {
    getLists,
    createList,
    updateList,
    deleteList
};
