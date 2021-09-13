import { db, createUser } from './utils';
import { getLists, createList, updateList, deleteList } from '../src/controllers/lists';
import { createTask } from '../src/controllers/tasks';

const { Lists } = db;

describe('Lists API', () => {
    test('Can be created with valid data', async () => {
        expect.assertions(2);
        const user = await createUser();
        const list = await createList({ title: 'Test' }, { db, user });
        expect(list.title).toBe('Test');
        expect(list.members[0]._id).toMatchId(user._id);
    });

    test('Can fetch single list ', async () => {
        const user = await createUser();
        const list = await createList({ title: 'Test' }, { db, user });
        expect(list).toHaveProperty('_id');
        expect(list).toHaveProperty('id');
        expect(list.additionalTasks).toBe(0);
        expect(list.color).toBe('#666666');
        expect(list.completedTasks).toHaveLength(0);
        expect(list.members).toHaveLength(1);
        expect(list.members[0]).toMatchObject({
            _id: user._id,
            firstName: user.firstName
        });
        expect(list.owner).toBe(user._id);
        expect(list.tasks).toHaveLength(0);
        expect(list.title).toBe('Test');
        expect(list.type).toBe('default');
    });

    test('Provides clear error messages when invalid data provided', async () => {
        expect.assertions(2);
        const user = await createUser();
        try {
            await createList({ title: '' }, { db, user });
        } catch (err) {
            expect(err.name).toBe('ValidationError');
            expect(err.message).toBe('List validation failed: title: Path `title` is required.');
        }
    });

    test('Protects sensitive fields', async () => {
        expect.assertions(1);
        const user = await createUser();
        const list = await createList({ title: 'Evil Task', type: 'inbox' }, { db, user });
        expect(list.type).toBe('default');
    });

    test('Protects against non-member modification', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        const list = await createList({ title: 'Good List' }, { db, user: user1 });
        try {
            await updateList(list._id, { title: 'Malicious List' }, { db, user: user2 });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid List ID');
        }
    });

    test('Protects against fetching invalid list ID', async () => {
        expect.assertions(2);
        const user = await createUser();
        try {
            await createTask('INVALID_ID', { title: 'Good List' }, { db, user });
        } catch (err) {
            expect(err.message).toBe('Invalid List ID');
            expect(err.name).toBe('AccessError');
        }
    });

    test('Allows list to be modified', async () => {
        expect.assertions(1);
        const user = await createUser();
        const list = await createList({ title: 'OK List' }, { db, user });
        const updatedList = await updateList(list._id, { title: 'Good List' }, { db, user });
        expect(updatedList.title).toBe('Good List');
    });

    test('Allows list to be deleted', async () => {
        expect.assertions(1);
        const user = await createUser();
        const list = await createList({ title: 'Temp List' }, { db, user });
        const deletedList = await deleteList(list._id, { db, user });
        expect(deletedList.success).toBeTruthy();
    });

    test('When deleting lists, removes for all users', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        let list = await createList({ title: 'Temp List' }, { db, user: user1 });
        // Add user 2 to the list
        await updateList(list._id, { members: [user1._id, user2._id] }, { db, user: user1 });
        // Delete the list
        await deleteList(list._id, { db, user: user1 });
        // We query db directly because .populate removes invalid ids
        const lists1 = await db.Users.findById(user1._id);
        const lists2 = await db.Users.findById(user2._id);
        // Ensure removed from all users
        expect(lists1.lists).toHaveLength(0);
        expect(lists2.lists).toHaveLength(0);
    });

    test('Allows fetching multiple lists', async () => {
        expect.assertions(1);
        const user = await createUser();
        const randomNumber = Math.floor(Math.random() * 10) + 1; // random between 1 and 10
        for (let i of [...Array(randomNumber).keys()]) {
            await createList({ title: `List ${i}` }, { db, user });
        }
        const fetchedLists = await getLists(null, {}, { db, user });
        expect(fetchedLists).toHaveLength(randomNumber + 1); // all created lists and inbox
    });

    test('Protects against fetching list non-member list', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        const list = await createList({ title: 'Good List' }, { db, user: user1 });
        try {
            await getLists(list._id, {}, { db, user: user2 });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid List ID');
        }
    });

    test('Protects against non-member deletion', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        const list = await createList({ title: 'Good List' }, { db, user: user1 });
        try {
            await deleteList(list._id, { db, user: user2 });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid List ID');
        }
    });

    test('Allows members to be added to list', async () => {
        expect.assertions(1);
        const user1 = await createUser();
        const user2 = await createUser();
        let list = await createList({ title: 'Title' }, { db, user: user1 });
        await updateList(list._id, { members: [user1._id, user2._id] }, { db, user: user1 });
        list = await getLists(list._id, {}, { db, user: user1 });
        expect(list.members.map(m => m._id)).toEqual(
            expect.arrayContaining([user1._id, user2._id])
        );
    });

    test('Protects against removing owner from list', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        let list = await createList({ title: 'Title' }, { db, user: user1 });
        await updateList(list._id, { members: [user1._id, user2._id] }, { db, user: user1 });
        try {
            await updateList(list._id, { members: [user2._id] }, { db, user: user2 });
        } catch (err) {
            expect(err.name).toBe('ValidationError');
            expect(err.message).toBe(
                'List validation failed: members: Not permitted to remove owner!'
            );
        }
    });

    test('Allows lists tasks to be reordered', async () => {
        const user = await createUser();
        let list = await createList({ title: 'Test' }, { db, user });
        const task1 = await createTask(list._id, { title: 'Test 1' }, { db, user });
        const task2 = await createTask(list._id, { title: 'Test 2' }, { db, user });
        const task3 = await createTask(list._id, { title: 'Test 3' }, { db, user });
        list = await getLists(list._id, {}, { db, user });
        console.log(list);
        const sanitizeId = task => task._id.toString();
        expect(list.tasks.map(sanitizeId)).toMatchObject([task3, task2, task1].map(sanitizeId));
        list = await updateList(
            list._id,
            {
                tasks: [task1, task2, task3].map(sanitizeId)
            },
            { db, user }
        );
        list = await getLists(list._id, {}, { db, user });
        expect(list.tasks.map(sanitizeId)).toMatchObject([task1, task2, task3].map(sanitizeId));
    });

    test('Prevents tasks from being injected during reorder', async () => {
        const user = await createUser();
        let list = await createList({ title: 'Test' }, { db, user });
        const task1 = await createTask(list._id, { title: 'Good Task' }, { db, user });
        const task2 = await createTask(list._id, { title: 'Good Task' }, { db, user });
        const badTask = await createTask(
            (await createList({ title: 'Test' }, { db, user }))._id,
            { title: 'Bad Task' },
            { db, user }
        );
        try {
            await updateList(
                list._id,
                { tasks: [badTask._id.toString(), task1._id.toString()] },
                { db, user }
            );
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid modification of tasks');
        }
        list = await getLists(list._id, {}, { db, user });
        expect(list.tasks).toHaveLength(2);
        expect(list.tasks[1]._id).toMatchId(task1._id);
        expect(list.tasks[0]._id).toMatchId(task2._id);
    });

    test('Prevents tasks from being removed during reorder', async () => {
        const user = await createUser();
        let list = await createList({ title: 'Test' }, { db, user });
        const task1 = (await createTask(list._id, { title: 'Good Task' }, { db, user }))._id;
        const task2 = (await createTask(list._id, { title: 'Good Task' }, { db, user }))._id;
        try {
            await updateList(list._id, { tasks: [task2] }, { db, user });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid modification of tasks');
        }
        list = await getLists(list._id, {}, { db, user });
        expect(list.tasks).toHaveLength(2);
        expect(list.tasks[1]._id).toMatchId(task1._id);
        expect(list.tasks[0]._id).toMatchId(task2._id);
    });

    test('Requires that the colour be a valid hex code', async () => {
        expect.assertions(6);
        const user = await createUser();
        const props = { db, user };
        const badColors = ['red', '#SSSSSS'];
        const goodColors = ['#FFF', '#FF00AA'];
        for (let color of goodColors) {
            await createList({ title: 'test', color }, props).then(list =>
                expect(list.color).toBe(color)
            );
        }
        for (let color of badColors) {
            await createList({ title: 'test', color }, props).catch(err => {
                expect(err.name).toBe('ValidationError');
                expect(err.message).toContain('hex');
            });
        }
    });
});

describe('Lists Schema', () => {
    test('Requires the `owner` property to be set', async () => {
        expect.assertions(1);
        try {
            await Lists.create({
                title: 'Test',
                owner: 'invalid_id'
            });
        } catch (err) {
            expect(err.message).toContain('List validation failed: owner: Cast to ObjectId failed');
        }
    });

    test(`Doesn't allow modification of the 'owners' property`, async () => {
        expect.assertions(1);
        try {
            const list = await Lists.findOne({});
            list.owner = '5b99d4d74a6df02dbddf9097'; // random valid id
            await list.save();
        } catch (err) {
            expect(err.message).toContain(
                'List validation failed: owner: Not permitted to modify owner!'
            );
        }
    });
});
