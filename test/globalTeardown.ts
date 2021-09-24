import database, { connect, disconnect } from '../src/database';

export default async (): Promise<void> => {
    // Connect, destroy, disconnect.
    await connect();
    // TODO: not sure why but sleeping helps ensure deletion...
    await sleep();
    await database.connection.db.dropDatabase();
    // await database.connection.db.dropDatabase();
    await disconnect();
};

const sleep = () => new Promise(resolve => setTimeout(resolve, 1000));
