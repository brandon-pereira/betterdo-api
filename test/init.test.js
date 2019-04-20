const { teardown, database, createUser } = require('./setup');
const { createList, getLists } = require('../src/controllers/lists');
const { createTask } = require('../src/controllers/tasks');
const init = require('../src/controllers/init');

let user;
let inbox;
let validTask;
let validList;
beforeAll(async () => {
    user = await createUser({ createInbox: true });
    inbox = await getLists('inbox', { user, database });
    validTask = await createTask(inbox._id, { title: 'Lorem Ipsum' }, { database, user });
    validList = await createList({ title: 'Valid List' }, { database, user });
    await createTask(
        validList._id,
        { title: "Shouldn't be exposed in init call!" },
        { database, user }
    );
});
afterAll(teardown);

describe('Initialization', () => {
    test('Should return user information', async () => {
        const response = await init(undefined, { database, user: user });
        expect(typeof response.user).toBe('object');
        expect(response.user.toObject()).toMatchObject(user.toObject());
    });

    test('Should return inbox and its tasks', async () => {
        const response = await init(undefined, { database, user: user });
        expect(typeof response.currentList).toBe('object');
        expect(response.currentList._id).toMatchId(inbox._id);
        expect(response.currentList.type).toBe('inbox');
        expect(response.currentList.tasks).toHaveLength(1);
        expect(typeof response.currentList.tasks[0]).toBe('object');
        expect(response.currentList.tasks[0].title).toBe(validTask.title);
    });

    test('Protects against entering invalid lists', async () => {
        const response = await init('invalid_list', { database, user: user });
        expect(typeof response.currentList).toBe('object');
        expect(response.currentList._id).toMatchId(inbox._id);
        expect(response.currentList.type).toBe('inbox');
        expect(response.currentList.tasks).toHaveLength(1);
        expect(typeof response.currentList.tasks[0]).toBe('object');
        expect(response.currentList.tasks[0].title).toBe(validTask.title);
    });

    test('Should return lists', async () => {
        const response = await init(undefined, { database, user: user });
        expect(Array.isArray(response.lists)).toBeTruthy();
        expect(response.lists).toHaveLength(2); // inbox + second list
        expect(response.lists[0].title).toBe('Inbox');
        expect(response.lists[1].title).toBe('Valid List');
    });

    test("Shouldn't expose tasks in the lists array", async () => {
        const response = await init(undefined, { database, user: user });
        expect(Array.isArray(response.lists[1].tasks)).toBeTruthy();
        expect(response.lists[1].tasks).toHaveLength(1);
        expect(typeof response.lists[1].tasks[0].toString()).toBe('string');
    });
});
