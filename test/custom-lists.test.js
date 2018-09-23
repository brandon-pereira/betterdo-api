const { teardown, database, createUser } = require('./setup');
// const TaskSchema = database.Tasks;
// const ListSchema = database.Lists;
const { createTask } = require('../src/controllers/tasks');
const { createList, getLists } = require('../src/controllers/lists');

let user1;
let user2;
let validList1;
let validList2;
beforeAll(async () => {
    user1 = await createUser();
    user2 = await createUser();
    validList1 = await createList({ title: 'Valid List' }, { database, user: user1 });
    validList2 = await createList({ title: 'Valid List' }, { database, user: user2 });
});
afterAll(teardown);

describe('Custom Lists API', () => {
    test('Custom Lists', async () => {
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
        const user1lists = await getLists('high-priority', { database, user: user1 });
        expect(user1lists).toHaveLength(1);
    });
});
