process.env.DATABASE_NAME = 'betterdo-unittests';
const database = require('../src/database');
const createUser = () =>
    database.Users.create({
        firstName: 'unitTest'
    });

async function teardown() {
    await database.connection.dropDatabase();
    await database.connection.close();
}

module.exports = {
    teardown,
    database,
    createUser
};
