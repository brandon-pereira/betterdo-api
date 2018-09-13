const database = require('../database');

module.exports = (app) => {

	// GET method route
	app.get('/tasks/:listId', async function (req, res) {
        console.log(req.params)
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
    });

    app.put('/tasks', async function (req, res) {
		try {
			const task = await database.Tasks.create({
                title: req.body.title,
                list: req.body.list,
                createdBy: req.user._id
			});
			res.json(Object.assign({
				"success": true
			}, task))
		} catch(err) {
			console.log(err);
			res.status(500).json({error: "Invalid"})
		}
	});
}