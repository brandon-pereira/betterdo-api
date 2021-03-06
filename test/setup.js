process.env.DATABASE_NAME = 'betterdo-unitTests';
const database = require('../src/database');

expect.extend({
    toMatchId(received, id) {
        const pass = received.toString() === id.toString();
        return {
            message: () => `expected "${received}" to match "${id}"`,
            pass
        };
    }
});

const createUser = async () => {
    const user = await database.Users.create({
        firstName: 'unitTest',
        email: `${Date.now()}-${Math.random()}@unitTests.com`,
        customLists: {
            highPriority: false,
            today: false
        }
    });
    await database.Lists.create({
        title: 'Inbox',
        type: 'inbox',
        owner: user._id
    });
    return user;
};

async function teardown() {
    // await database.connection.db.dropDatabase();
}

module.exports = {
    teardown,
    database,
    createUser
};
