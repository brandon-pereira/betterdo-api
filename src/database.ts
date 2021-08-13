import mongoose from 'mongoose';
import { Database } from './types';

// mongoose.Promise = Promise;
mongoose.connection.on('error', err => console.error('connection error:', err));

mongoose.connect(`mongodb://localhost/${process.env.DATABASE_NAME || 'betterdo'}`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db: Database = {
    connection: mongoose.connection,
    Lists: require('./schemas/lists').default,
    // Tasks: require('./schemas/tasks').default,
    Users: require('./schemas/users').default
};

export default db;
