process.env.DATABASE_NAME = 'betterdo-unittests';
const database = require('../src/database');

async function setup() {

}

async function teardown() {
    await database.connection.dropDatabase();
    await database.connection.close()
}

module.exports = {
    setup,
    teardown,
    ...database
}