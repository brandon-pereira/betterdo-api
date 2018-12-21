process.env.DATABASE_NAME = 'betterdo-unitTests';
const database = require('../src/database');
const createUser = async ({ createInbox } = {}) => {
    const user = await database.Users.create({
        firstName: 'unitTest',
        customLists: {
            highPriority: false,
            today: false
        }
    });
    if (createInbox) {
        await database.Lists.create({
            title: 'Inbox',
            type: 'inbox',
            owner: user._id
        });
    }
    return user;
};

async function teardown() {}

module.exports = {
    teardown,
    database,
    createUser
};
