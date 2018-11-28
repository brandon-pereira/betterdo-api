const { teardown, database, createUser } = require('./setup');
// const TaskSchema = database.Tasks;
const ListSchema = database.Lists;
const { createTask, updateTask, deleteTask } = require('../src/controllers/tasks');
const { createList, getLists } = require('../src/controllers/lists');

let user;
let validList;
beforeAll(async () => {
    user = await createUser();
    validList = await createList({ title: 'Valid List' }, { database, user });
});
afterAll(teardown);

describe('Tasks API', () => {
    test('Can be created with valid data', async () => {
        const task = await createTask(validList._id, { title: 'Test' }, { database, user });
        expect(task.list).toEqual(validList._id);
        expect(task.title).toBe('Test');
    });

    test('Adds/removes tasks to list object on relevant task', async () => {
        let list = await createList({ title: 'New List' }, { database, user });
        const task = await createTask(list._id, { title: 'Test' }, { database, user });
        await ListSchema.addTaskToList(task._id, list._id); // ensure no duplicates
        list = await ListSchema.findById(list._id);
        expect(list.tasks).toContain(task._id);
        expect(list.tasks).toHaveLength(1); // if 2, not deduping
        await deleteTask(task._id, { database, user });
        list = await ListSchema.findById(list._id);
        expect(list.tasks).toHaveLength(0);
    });

    test('Allows list to be changed via the updateTask method', async () => {
        let list1 = await createList({ title: 'New List 1' }, { database, user });
        let list2 = await createList({ title: 'New List 2' }, { database, user });
        const task = await createTask(list1._id, { title: 'Test' }, { database, user });
        await updateTask(task._id, { list: list2._id }, { database, user });
        list1 = await ListSchema.findById(list1._id);
        list2 = await ListSchema.findById(list2._id);
        expect(list1.tasks).not.toContain(task._id);
        expect(list2.tasks).toContain(task._id);
    });

    test('Allows tasks to be set to complete and returns correct count', async () => {
        let list = await createList({ title: 'New List' }, { database, user });
        expect(list.completedTasks).toBe(0);
        expect(list.tasks).toHaveLength(0);
        const task = await createTask(list._id, { title: 'Test' }, { database, user });
        list = await getLists(list._id, { database, user });
        expect(list.completedTasks).toBe(0);
        expect(list.tasks).toHaveLength(1);
        await updateTask(task._id, { isCompleted: true }, { database, user });
        list = await getLists(list._id, { database, user });
        expect(list.completedTasks).toBe(1);
        expect(list.tasks).toHaveLength(0);
    });

    test('Provides clear error messages when invalid data provided', async () => {
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
        const task = await createTask(
            validList._id,
            { title: 'Test', createdBy: 'bad-user' },
            { database, user }
        );
        expect(task.title).toBe('Test');
        expect(task.createdBy).toBe(user._id);
    });

    test('Protects against modifying protected fields', async () => {
        expect.assertions(2);
        const task = await createTask(validList._id, { title: 'Test' }, { database, user });
        try {
            await updateTask(task._id, { creationDate: new Date() }, { database, user });
        } catch (err) {
            expect(err.name).toBe('ValidationError');
            expect(err.message).toBe(
                'Task validation failed: creationDate: Not permitted to modify creationDate!'
            );
        }
    });

    test('Protects against non-member modification', async () => {
        const badGuy = await createUser();
        let task = await createTask(validList._id, { title: 'Good Task' }, { database, user });
        task = await updateTask(task._id, { title: 'Good Update' }, { database, user });
        try {
            await updateTask(task._id, { title: 'Bad Update' }, { database, user: badGuy });
        } catch (err) {
            expect(err.name).toBe('PermissionsError');
            expect(err.message).toBe('User is not authorized to access task');
            expect(task.title).toBe('Good Update');
        }
        const badGuysList = await createList(
            { title: 'Bad Guys List' },
            { database, user: badGuy }
        );
        try {
            await updateTask(task._id, { list: badGuysList._id }, { database, user });
        } catch (err) {
            expect(err.name).toBe('PermissionsError');
            expect(err.message).toBe('User is not authorized to access list');
        }
    });

    test('Protects against non-member deletion', async () => {
        const badGuy = await createUser();
        const task = await createTask(validList._id, { title: 'Good Task' }, { database, user });
        try {
            await deleteTask(task._id, { database, user: badGuy });
        } catch (err) {
            expect(err.name).toBe('PermissionsError');
            expect(err.message).toBe('User is not authorized to access task');
        }
    });
});
