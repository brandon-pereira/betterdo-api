const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connection.on('error',(err) => console.error('connection error:', err))

mongoose.connect('mongodb://localhost/betterdo', {
  useMongoClient: true
});

module.exports = {
  connection: mongoose.connection,
  Lists: require('./schemas/list')(mongoose),
  Tasks: require('./schemas/task')(mongoose),
  Users: require('./schemas/user')(mongoose)
};