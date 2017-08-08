// get lists
// put lists
// delete lists
// post lists
// 
module.exports = (app) => {
	
	// GET method route
	app.get('/lists', function (req, res) {
		res.send('GET LISTS');
	})

	// POST method route
	app.post('/lists', function (req, res) {
		res.send('POST request to the homepage')
	})
	
}