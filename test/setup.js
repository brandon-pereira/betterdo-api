process.env.DATABASE_NAME = 'betterdo-unitTests';
const database = require('../src/database');
const createUser = () =>
    database.Users.create({
        firstName: 'unitTest'
    });

async function teardown() {}

module.exports = {
    teardown,
    database,
    createUser
};
