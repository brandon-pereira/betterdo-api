const { database, createUser } = require('./setup');
const { Users } = database;
const { updateUser, getUser } = require('../src/controllers/users');
const { createList } = require('../src/controllers/lists');

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

    test('Allows global push subscription to be toggled', async () => {
        userCache = await createUser();
        userCache = await Users.findById(userCache._id);
        expect(userCache.isPushEnabled).toBe(true);
        await updateUser({ isPushEnabled: false }, { database, user: userCache });
        userCache = await Users.findById(userCache._id);
        expect(userCache.isPushEnabled).toBe(false);
    });

    test('Allows push subscriptions to be added', async () => {
        const notifier = { send: jest.fn() };
        userCache = await createUser();
        userCache = await Users.findById(userCache._id);
        expect(userCache.pushSubscriptions).toHaveLength(0);
        await updateUser({ pushSubscription: 'test1' }, { database, notifier, user: userCache });
        userCache = await Users.findById(userCache._id);
        expect(userCache.pushSubscriptions).toEqual(expect.arrayContaining(['test1']));
        await updateUser({ pushSubscription: 'test2' }, { database, notifier, user: userCache });
        await updateUser({ pushSubscription: 'test1' }, { database, notifier, user: userCache });
        userCache = await Users.findById(userCache._id);
        expect(userCache.pushSubscriptions).toEqual(expect.arrayContaining(['test1', 'test2']));
        expect(notifier.send.mock.calls.length).toBe(2);
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

    test('Allows users lists to be reordered', async () => {
        let user = await createUser();
        const list1 = await createList({ title: 'Test 1' }, { database, user });
        const list2 = await createList({ title: 'Test 2' }, { database, user });
        const list3 = await createList({ title: 'Test 3' }, { database, user });
        user = await Users.findById(user._id);
        const sanitizeId = task => task._id.toString();
        expect(user.lists.map(sanitizeId)).toMatchObject([list1, list2, list3].map(sanitizeId));
        await updateUser(
            {
                lists: [list3, list2, list1].map(sanitizeId)
            },
            { database, user }
        );
        user = await Users.findById(user._id);
        expect(user.lists.map(sanitizeId)).toMatchObject([list3, list2, list1].map(sanitizeId));
    });

    test('Prevents lists from being injected during reorder', async () => {
        let user1 = await createUser();
        const user2 = await createUser();
        const list1 = await createList({ title: 'Good' }, { database, user: user1 });
        const list2 = await createList({ title: 'Good' }, { database, user: user1 });
        const list3 = await createList({ title: 'BAD!' }, { database, user: user2 });
        try {
            await updateUser(
                { lists: [list1._id.toString(), list3._id.toString()] },
                { database, user: user1 }
            );
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid modification of lists');
        }
        user1 = await Users.findById(user1._id);
        expect(user1.lists).toHaveLength(2);
        expect(user1.lists[0]._id).toMatchId(list1._id);
        expect(user1.lists[1]._id).toMatchId(list2._id);
    });

    test('Prevents lists from being removed during reorder', async () => {
        let user = await createUser();
        const list1 = await createList({ title: 'Good' }, { database, user });
        const list2 = await createList({ title: 'Good' }, { database, user });
        try {
            await updateUser({ lists: [list2] }, { database, user });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid modification of lists');
        }
        user = await Users.findById(user._id);
        expect(user.lists).toHaveLength(2);
        expect(user.lists[0]._id).toMatchId(list1._id);
        expect(user.lists[1]._id).toMatchId(list2._id);
    });
});
