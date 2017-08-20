require('dotenv').config();

const app = require('./lib/app');

app.get('/', (req, res) => {
  res.json(Object.assign({hello: 'world'}, req.user));
});

require('./lib/routes/lists.js')(app);
