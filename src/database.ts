import mongoose from 'mongoose';
import { connection } from 'mongoose';
import Users, { UserModel } from './schemas/users';
import Lists, { ListModel } from './schemas/lists';
import Tasks, { TaskModel } from './schemas/tasks';

export interface Database {
    connection: typeof connection;
    Users: UserModel;
    Lists: ListModel;
    Tasks: TaskModel;
}

// mongoose.Promise = Promise;
mongoose.connection.on('error', err => console.error('connection error:', err));

export const MONGO_CONNECTION_URL = `mongodb://localhost/${
    process.env.DATABASE_NAME || 'betterdo'
}`;
mongoose.connect(MONGO_CONNECTION_URL);

const db: Database = {
    connection: mongoose.connection,
    Lists,
    Tasks,
    Users
};

export default db;
