async function getLists({ req, res, database }) {
    try {
        // TODO: Ensure valid permissions
        // Get lists based on query data
        const lists = await database.Lists.getLists(req.user._id, req.params.listId, {
            userQueryData: ['_id', 'firstName', 'lastName']
        })
        // If the user is querying a specific list, return it
        if(req.params.listId) {
            if(Array.isArray(lists) && lists.length) {
                return res.json({
                    list: lists[0]
                })
            }
            return res.status(404).json({error: "Invalid listId."});
        }
        // Else, return all found lists
        res.json({lists})
    } catch(err) {
        console.log("GET `/api/lists` received an unexpected error.", err)
        res.status(500).json({error: "Error getting user lists"});
    }
}

async function createList({req, res, database}) {
    try {
        // TODO: Ensure valid permissions
        // Attempt to create the list
        const list = await database.Lists.create({
            ...req.body, // merge the two arrays.. assuming validator will catch any errors
            owner: req.user._id, // TODO: Ensure this is higher priority than the merge
            members: [
                req.user._id// TODO: Ensure this is higher priority than the merge
            ]
        });
        // Return new list to front-end
        res.json(list)
    } catch(err) {
        // TODO: Generic error handler method
        console.log(err);
        res.status(500).json({error: "Error creating the new list"})
    }
}

async function updateList({req, res, database}) {
    if(!req.params.listId) {
        return res.status(404).json({error: "Missing listId parameter"})
    }
    try {
        // TODO: Ensure valid permissions
        // Get list by the ID passed
        const list = await database.Lists.findById(req.params.listId);
        if(!list) {
            return res.status(404).json({error: "Invalid listId parameter"})
        }
        // Merge the lists.. we need to be cautious here.
        // Currently assuming the validation on the model will handle errors
        Object.assign(list, req.body);
        // Save the model
        await list.save();
        // Return list to front-end
        res.json(list)
    } catch(err) {
        console.log("POST /api/lists failed", err)
        let errors = [];
        if(err.errors) {
            errors = Object.values(err.errors).map(err => ({
                key: err.path,
                error: err.message
            }));
        }
        res.status(500).json({
            error: "Error updating list",
            errors: errors
        })
    }
}


module.exports = {
    getLists,
    createList,
    updateList
};