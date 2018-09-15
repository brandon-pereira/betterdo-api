const { handleUncaughtError, throwError } = require('./helpers');

async function createTask({req, res, database}) {
    const userId = req.user._id;
    const listId = req.body.listId;
    try {
         // Ensure list id is passed
         if(!listId) throwError("Invalid List ID");
         // Ensure list exists and user has permissions
        const list = await database.Lists.findOne({ _id: listId, members: userId });
        // If no results, throw error
        if(!list) throwError("Invalid List ID");
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
        // Return new list to front-end
        res.json({ task })
    } catch(err) {
        handleUncaughtError('creating list', res, err)
    }
}

module.exports = {
    createTask
}