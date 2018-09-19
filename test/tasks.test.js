const { teardown, database, createUser } = require('./setup');
// const TaskSchema = database.Tasks;
const ListSchema = database.Lists;
const { createTask, updateTask, deleteTask } = require('../src/controllers/tasks');
const { createList } = require('../src/controllers/lists');

let user;
let validList;
beforeAll(async () => {
    user = await createUser();
    validList = await createList({ title: 'Valid List' }, { database, user });
});
afterAll(teardown);

describe('Tasks API', () => {
    test('Can be created with valid data', async () => {
        expect.assertions(2);
        const task = await createTask(validList._id, { title: 'Test' }, { database, user });
        expect(task.list).toBe(validList._id);
        expect(task.title).toBe('Test');
    });

    test('Adds tasks to list object on creation', async () => {
        expect.assertions(1);
        const task = await createTask(validList._id, { title: 'Test' }, { database, user });
        const list = await ListSchema.findById(validList._id);
        console.log(list);
        expect(list.tasks).toContain(task._id);
    });

    test('Provides clear error messages when invalid data provided', async () => {
        expect.assertions(2);
        try {
            await createTask(
                validList._id,
                { title: 'Hello', priority: 'super-high' },
                { database, user }
            );
        } catch (err) {
            expect(err.name).toBe('ValidationError');
            expect(err.message).toBe(
                'Task validation failed: priority: `super-high` is not a valid enum value for path `priority`.'
            );
        }
    });

    test('Protects sensitive fields', async () => {
        expect.assertions(2);
        const task = await createTask(
            validList._id,
            { title: 'Test', createdBy: 'bad-user' },
            { database, user }
        );
        expect(task.title).toBe('Test');
        expect(task.createdBy).toBe(user._id);
    });

    test('Protects against non-member modification', async () => {
        expect.assertions(3);
        const badGuy = await createUser();
        let task = await createTask(validList._id, { title: 'Good Task' }, { database, user });
        task = await updateTask(task._id, { title: 'Good Update' }, { database, user });
        try {
            task = await updateTask(task._id, { title: 'Bad Update' }, { database, user: badGuy });
        } catch (err) {
            expect(err.code).toBe('PermissionsError');
            expect(err.message).toBe('User is not authorized to access task');
            expect(task.title).toBe('Good Update');
        }
    });

    test('Protects against non-member deletion', async () => {
        expect.assertions(2);
        const badGuy = await createUser();
        const task = await createTask(validList._id, { title: 'Good Task' }, { database, user });
        try {
            await deleteTask(task._id, { database, user: badGuy });
        } catch (err) {
            expect(err.code).toBe('PermissionsError');
            expect(err.message).toBe('User is not authorized to access task');
        }
    });
});
