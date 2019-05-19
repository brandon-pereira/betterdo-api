process.env.DATABASE_NAME = 'betterdo-unitTests';
const database = require('../src/database');

module.exports = async () => {
    // We call find one to ensure we're connected..
    // I tried others but this was most reliable.
    await database.Users.findOne({});
    await database.connection.db.dropDatabase();
    await database.connection.close();
};
