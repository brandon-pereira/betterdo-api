import { db, createUser } from './utils';
import { createTask, updateTask, deleteTask, getTask } from '../src/controllers/tasks';
import { createList, getLists } from '../src/controllers/lists';

const { Lists } = db;

let user;
let validList;
beforeAll(async () => {
    user = await createUser();
    validList = await createList({ title: 'Valid List' }, { db, user });
});

describe('Tasks API', () => {
    test('Can be created with valid data', async () => {
        const task = await createTask(validList._id, { title: 'Test' }, { db, user });
        expect(task.list).toEqual(validList._id);
        expect(task.title).toBe('Test');
    });

    test('Can retrieve task details when queried', async () => {
        const createdTask = await createTask(validList._id, { title: 'Test' }, { db, user });
        const task = await getTask(createdTask.id, { db, user });
        expect(task.list).toMatchId(validList.id);
        expect(task.id).toMatchId(createdTask.id);
        expect(task.title).toBe('Test');
    });

    test('Adds/removes tasks to list object on relevant task', async () => {
        let list = await createList({ title: 'New List' }, { db, user });
        const task = await createTask(list._id, { title: 'Test' }, { db, user });
        await Lists.addTaskToList(task._id, list._id); // ensure no duplicates
        list = await Lists.findById(list._id);
        expect(list.tasks).toContainEqual(task._id);
        expect(list.tasks).toHaveLength(1); // if 2, not deduping
        await deleteTask(task._id, { db, user });
        list = await Lists.findById(list._id);
        expect(list.tasks).toHaveLength(0);
    });

    test('Allows list to be changed via the updateTask method', async () => {
        let list1 = await createList({ title: 'New List 1' }, { db, user });
        let list2 = await createList({ title: 'New List 2' }, { db, user });
        const task = await createTask(list1._id, { title: 'Test' }, { db, user });
        await updateTask(task.id, { list: list2._id }, { db, user });
        list1 = await Lists.findById(list1._id);
        list2 = await Lists.findById(list2._id);
        expect(list1.tasks).not.toContainEqual(task._id);
        expect(list2.tasks).toContainEqual(task._id);
    });

    test('Allows tasks to be set to complete and returns correct count', async () => {
        let list = await createList({ title: 'New List' }, { db, user });
        expect(list.additionalTasks).toBe(0);
        expect(list.tasks).toHaveLength(0);
        const task = await createTask(list._id, { title: 'Test' }, { db, user });
        list = await getLists(list._id, {}, { db, user });
        expect(list.additionalTasks).toBe(0);
        expect(list.tasks).toHaveLength(1);
        await updateTask(task._id, { isCompleted: true }, { db, user });
        list = await getLists(list.id, {}, { db, user });
        expect(list.additionalTasks).toBe(1);
        expect(list.tasks).toHaveLength(0);
        list = await getLists(list.id, {}, { db, user, includeCompleted: true });
        expect(list.additionalTasks).toBe(0);
        expect(list.completedTasks).toHaveLength(1);
        expect(list.tasks).toHaveLength(0);
        await updateTask(task.id, { isCompleted: false }, { db, user });
        list = await getLists(list.id, {}, { db, user });
        expect(list.additionalTasks).toBe(0);
        expect(list.tasks).toHaveLength(1);
        list = await getLists(list.id, { db, user, includeCompleted: true });
        expect(list.additionalTasks).toBe(0);
        expect(list.completedTasks).toHaveLength(0);
        expect(list.tasks).toHaveLength(1);
        let list2 = await createList({ title: 'New List 2' }, { db, user });
        await updateTask(task.id, { list: list2.id, isCompleted: true }, { db, user });
        list = await getLists(list.id, { db, user });
        list2 = await getLists(list2.id, { db, user });
        expect(list.additionalTasks).toBe(0);
        expect(list.tasks).toHaveLength(0);
        expect(list2.additionalTasks).toBe(1);
        expect(list2.tasks).toHaveLength(0);
        await updateTask(task.id, { list: list.id }, { db, user });
        list = await getLists(list.id, { db, user });
        list2 = await getLists(list2.id, { db, user });
        expect(list2.additionalTasks).toBe(0);
        expect(list2.tasks).toHaveLength(0);
        expect(list.additionalTasks).toBe(1);
        expect(list.tasks).toHaveLength(0);
    });

    test('Provides clear error messages when invalid data provided', async () => {
        try {
            await createTask(
                validList._id,
                { title: 'Hello', priority: 'super-high' },
                { db, user }
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
            { db, user }
        );
        expect(task.title).toBe('Test');
        expect(task.createdBy).toBeDefined();
        expect(typeof task.createdBy).toBe('object');
    });

    test('Protects against modifying protected fields', async () => {
        expect.assertions(2);
        const task = await createTask(validList._id, { title: 'Test' }, { db, user });
        try {
            await updateTask(task._id, { creationDate: new Date() }, { db, user });
        } catch (err) {
            expect(err.name).toBe('ValidationError');
            expect(err.message).toBe(
                'Task validation failed: creationDate: Not permitted to modify creationDate!'
            );
        }
    });

    test('Protects against non-member modification', async () => {
        const badGuy = await createUser();
        let task = await createTask(validList._id, { title: 'Good Task' }, { db, user });
        task = await updateTask(task._id, { title: 'Good Update' }, { db, user });
        try {
            await updateTask(task._id, { title: 'Bad Update' }, { db, user: badGuy });
        } catch (err) {
            expect(err.name).toBe('PermissionsError');
            expect(err.message).toBe('User is not authorized to access task');
            expect(task.title).toBe('Good Update');
        }
        const badGuysList = await createList({ title: 'Bad Guys List' }, { db, user: badGuy });
        try {
            await updateTask(task._id, { list: badGuysList._id }, { db, user });
        } catch (err) {
            expect(err.name).toBe('PermissionsError');
            expect(err.message).toBe('User is not authorized to access list');
        }
    });

    test('Protects against non-member deletion', async () => {
        const badGuy = await createUser();
        const task = await createTask(validList._id, { title: 'Good Task' }, { db, user });
        try {
            await deleteTask(task._id, { db, user: badGuy });
        } catch (err) {
            expect(err.name).toBe('PermissionsError');
            expect(err.message).toBe('User is not authorized to access task');
        }
    });
});
