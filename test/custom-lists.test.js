const { teardown, database, createUser } = require('./setup');
// const TaskSchema = database.Tasks;
// const ListSchema = database.Lists;
const { createTask } = require('../src/controllers/tasks');
const { createList, updateList, getLists, deleteList } = require('../src/controllers/lists');

let user1;
let user2;
let inbox;
let validList1;
let validList2;
beforeAll(async () => {
    user1 = await createUser({ createInbox: true });
    user2 = await createUser();
    inbox = await getLists('inbox', { user: user1, database });
    validList1 = await createList({ title: 'Valid List' }, { database, user: user1 });
    validList2 = await createList({ title: 'Valid List' }, { database, user: user2 });
});
afterAll(teardown);

describe('Custom Lists API', () => {
    test("Inbox shouldn't allow modification", async () => {
        await updateList(inbox._id, { title: 'Malicious' }, { database, user: user1 });
        const result = await getLists(inbox._id, { database, user: user1 });
        expect(result.title).toBe('Inbox');
    });
    test("Inbox shouldn't allow deletion", async () => {
        expect.assertions(2);
        try {
            await deleteList(inbox._id, { database, user: user1 });
        } catch (err) {
            expect(err.message).toBe('Invalid List ID');
            expect(err.name).toBe('AccessError');
        }
    });
    test('Today list should only return valid tasks', async () => {
        let today = await getLists('today', { database, user: user1 });
        expect(today.tasks).toHaveLength(0);
        await createTask(
            validList1._id,
            { title: 'Todo today!', dueDate: new Date() },
            { database, user: user1 }
        );
        today = await getLists('today', { database, user: user1 });
        expect(today.tasks).toHaveLength(1);
    });
    test('Tomorrow list should only return valid tasks', async () => {
        let today = await getLists('tomorrow', { database, user: user1 });
        expect(today.tasks).toHaveLength(0);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 30, 0, 0);
        await createTask(
            validList1._id,
            { title: 'Todo tomorrow!', dueDate: tomorrow },
            { database, user: user1 }
        );
        today = await getLists('tomorrow', { database, user: user1 });
        expect(today.tasks).toHaveLength(1);
    });
    test('High priority list should only return valid tasks', async () => {
        await createTask(
            validList1._id,
            { title: 'Invalid because not high-priority' },
            { database, user: user1 }
        );
        await createTask(
            validList2._id,
            { title: 'Invalid because wrong user', priority: 'high' },
            { database, user: user2 }
        );
        await createTask(
            validList1._id,
            { title: 'Valid', priority: 'high' },
            { database, user: user1 }
        );
        const user1lists = await getLists('highPriority', { database, user: user1 });
        expect(user1lists.tasks).toHaveLength(1);
    });
});
