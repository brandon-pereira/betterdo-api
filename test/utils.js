import db from '../src/database';

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
    const user = await db.Users.create({
        firstName: 'unitTest',
        email: `${Date.now()}-${Math.random()}@unitTests.com`,
        customLists: {
            highPriority: false,
            today: false
        }
    });
    await db.Lists.create({
        title: 'Inbox',
        type: 'inbox',
        owner: user._id
    });
    return user;
};

export { db, createUser };
