const { setup, teardown, database } = require('./setup');
const { Users } = database;

let userCache = null;

beforeAll(setup);

afterAll(teardown);

test('Creates a user', async () => {
    expect.assertions(4);
    const _userData = {
        firstName: 'unitTest'
    };
    userCache = await Users.findOrCreate('1', _userData);
    expect(userCache.firstName).toBe(_userData.firstName);
    expect(userCache.isBeta).toBeFalsy();
    expect(userCache.lastName).toBeUndefined();
    const foundUser = await Users.findById(userCache._id);
    expect(foundUser.firstName).toBe(_userData.firstName);
});

test('Throws error if missing required fields', async () => {
    expect.assertions(1);
    try {
        await Users.findOrCreate('1', {});
    } catch (err) {
        expect(err.message).toBe(
            'User validation failed: firstName: Path `firstName` is required.'
        );
    }
});
