const { handleUncaughtError, throwError } = require('./helpers');

async function getLists({ req, res, database }) {
    const userId = req.user._id;
    const listId = req.params.listId;
    try {
        // Get lists based on query data
        const lists = await database.Lists.getLists(userId, listId)
        // return appropriate results
        if(listId && Array.isArray(lists) && lists.length) { // specific list
            res.json({list: lists[0]})
        } else if(listId) { // specific list but no results
            throwError("Invalid List ID");
        } else { // all lists for user
            res.json({lists})
        }
    } catch(err) {
        handleUncaughtError('getting lists', res, err)
    }
}

async function createList({req, res, database}) {
    const owner = req.user._id;
    try {
        // Remove potentially harmful properties
        delete req.body.owner;
        delete req.body.members;
        delete req.body.type;
        // Attempt to create the list
        const list = await database.Lists.create({...req.body, owner});
        // Return new list to front-end
        res.json({ list })
    } catch(err) {
        handleUncaughtError('creating list', res, err)
    }
}

async function updateList({req, res, database}) {
    const listId = req.params.listId;
    const userId = req.user._id;
    try {
        // Ensure list id is passed
        if(!listId) throwError("Invalid List ID");
        // Get list
        const list = await database.Lists.findOne({ _id: listId, members: userId });
        // If no results, throw error
        if(!list) throwError("Invalid List ID");
        // Merge the lists.. validation on the model will handle errors
        Object.assign(list, req.body);
        // Save the model
        await list.save();
        // Return list to front-end
        res.json(list)
    } catch(err) {
        handleUncaughtError('updating list', res, err)
    }
}


module.exports = {
    getLists,
    createList,
    updateList
};