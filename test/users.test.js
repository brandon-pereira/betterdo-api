const { database, createUser } = require('./setup');
const { Users } = database;
const { updateUser, getUser } = require('../src/controllers/users');

let userCache = null;

describe('Users Schema', () => {
    test('Creates a user', async () => {
        expect.assertions(4);
        const _userData = {
            firstName: 'unitTest',
            email: `${Date.now()}-${Math.random()}@unitTests.com`
        };
        userCache = await Users.create(_userData);
        expect(userCache.firstName).toBe(_userData.firstName);
        expect(userCache.isBeta).toBeFalsy();
        expect(userCache.lastName).toBeUndefined();
        const foundUser = await Users.findById(userCache._id);
        expect(foundUser.firstName).toBe(_userData.firstName);
    });

    test('Throws error if missing required fields', async () => {
        expect.assertions(2);
        try {
            await Users.create({
                email: `${Date.now()}-${Math.random()}@unitTests.com`
            });
        } catch (err) {
            expect(err.message).toBe(
                'User validation failed: firstName: Path `firstName` is required.'
            );
        }
        try {
            await Users.create({
                firstName: 'unitTest'
            });
        } catch (err) {
            expect(err.message).toBe('User validation failed: email: Path `email` is required.');
        }
    });
});

describe('Users API', () => {
    test('Can be updated with valid data', async () => {
        userCache = await createUser();
        await updateUser({ firstName: 'John' }, { database, user: userCache });
        userCache = await Users.findById(userCache._id);
        expect(userCache.firstName).toBe('John');
    });

    test('Allows finding users with valid email', async () => {
        userCache = await createUser();
        const returnedUsers = await getUser(userCache.email, { database, user: userCache });
        userCache = await Users.findById(userCache._id);
        expect(returnedUsers._id).toMatchId(userCache._id);
    });

    test('Throws error finding users with invalid email', async () => {
        expect.assertions(2);
        userCache = await createUser();
        try {
            await getUser('fake@email.com', { database, user: userCache });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid User Email');
        }
    });

    test('Allows custom lists to be modified', async () => {
        userCache = await createUser();
        await updateUser(
            {
                customLists: {
                    tomorrow: true
                }
            },
            { database, user: userCache }
        );
        userCache = await Users.findById(userCache._id);
        expect(userCache.customLists).toMatchObject({
            highPriority: false,
            today: false,
            tomorrow: true
        });
    });
});
