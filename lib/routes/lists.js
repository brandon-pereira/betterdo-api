const database = require('../database');

// get lists
// put lists
// delete lists
// post lists
// 
module.exports = (app) => {
	
	// GET method route
	app.get('/lists', async function (req, res) {
		const l = await database.Lists.find({members: req.user._id});
		const users = await database.Users.findOne({_id: req.user._id});
		// const 
		res.json({lists: l, users});
			// .then((lists) => res.json(lists));
	})

	// POST method route
	app.post('/lists', function (req, res) {
		res.send('POST request to the homepage')
	})
	
}