const database = require('../database');

module.exports = (app) => {

	// GET method route
	app.get(['/lists', '/lists/:listId'], async function (req, res) {
		try {
			const userQueryData = ['_id', 'firstName', 'lastName'];
			const lists = await database.Lists.getLists(req.user._id, req.params.listId, { userQueryData})
			if(req.params.listId) {
				if(Array.isArray(lists) && lists.length) {
					res.json({
						list: lists[0]
					})
					return;
				}
				res.status(404).json({error: "Invalid list id."});
				return;
			}
			res.json({lists})
		} catch(err) {
			console.log("GET `/api/lists` received an unexpected error.", err)
			res.status(500).json({error: "Unexpected Error"});
		}
	});
	
	// POST method route
	app.put('/lists', async function (req, res) {
		try {
			const list = await database.Lists.create({
				title: req.body.title,
				owner: req.user._id,
				members: [
					req.user._id
				]
			});
			res.json(Object.assign({
				"success": true
			}, list))
		} catch(err) {
			console.log(err);
			res.status(500).json({error: "Invalid"})
		}
	});
	
	// app.post('/lists', async function (req, res) {
	// 	console.log(req.body);
	// 	try {
	// 		const list = await database.Lists.create({
	// 			title: req.body.title,
	// 			owner: req.body.owner
	// 		});
	// 		res.json(Object.assign({
	// 			"success": true
	// 		}, list))
	// 	} catch(err) {
	// 		console.log(err);
	// 		res.status(500).json({error: "Invalid"})
	// 	}
	// })
	
}