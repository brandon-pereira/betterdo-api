import database, { connect, disconnect } from '../src/database';

export default async (): Promise<void> => {
    await connect();
    // Sleep for a second, fixes raise conditions :shrug:
    await sleep();
    await database.connection.db.dropDatabase();
    await disconnect();
};

const sleep = () => new Promise(resolve => setTimeout(resolve, 1000));
