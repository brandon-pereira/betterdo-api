var mongoose = require('mongoose');
mongoose.Promise = Promise;
var db = mongoose.connection;
db.on('error',(err) => console.error('connection error:', err))

mongoose.connect('mongodb://localhost/betterdo', {
  useMongoClient: true,
});

module.exports = {
  List: require('./schemas/list')(mongoose),
  Task: require('./schemas/task')(mongoose),
  User: require('./schemas/user')(mongoose)
};