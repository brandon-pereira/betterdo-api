process.env.DATABASE_NAME = 'betterdo-unitTests';
import database from '../src/database';

export default async () => {
    // We call find one to ensure we're connected..
    // I tried others but this was most reliable.
    await database.Users.findOne({});
    await database.connection.db.dropDatabase();
    await database.connection.close();
    // TODO: this is a hacky fix for open handlers
    process.exit(0);
    return;
};
