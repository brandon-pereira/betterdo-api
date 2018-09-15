async function getTask({req, res, database}) {
    try {
        // const listUserQueryData = ['_id', 'firstName', 'lastName'];
        const tasks = await database.Tasks
            .find({list: req.params.listId})
            // .populate('members', listUserQueryData)
            // .populate('owner', listUserQueryData)
            .exec();
        res.json({tasks})
    } catch(err) {
        console.log("GET `/api/lists` received an unexpected error.", err)
        res.status(500).json({error: "Unexpected Error"});
    }
}

async function createTask({req, res, database}) {
    try {
        const task = await database.Tasks.createTask({
            title: req.body.title
        }, req.body.list, req.user._id);

        //add task to lost
        await database.Lists.addTaskToList(task._id, req.body.list);

        res.json(Object.assign({
            "success": true
        }, task))
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Invalid"})
    }
}
module.exports = {
    getTask,
    createTask
}