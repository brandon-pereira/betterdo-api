const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connection.on('error', err => console.error('connection error:', err));

mongoose.connect(`mongodb://localhost/${process.env.DATABASE_NAME || 'betterdo'}`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = {
    connection: mongoose.connection,
    Lists: require('./schemas/lists')(mongoose),
    Tasks: require('./schemas/tasks')(mongoose),
    Users: require('./schemas/users')(mongoose)
};
