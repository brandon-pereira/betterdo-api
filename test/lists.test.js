const { teardown, database, createUser } = require('./setup');
const ListSchema = database.Lists;
const { getLists, createList, updateList, deleteList } = require('../src/controllers/lists');
const { createTask } = require('../src/controllers/tasks');

afterAll(teardown);

describe('Lists API', () => {
    test('Can be created with valid data', async () => {
        expect.assertions(2);
        const user = await createUser();
        const list = await createList({ title: 'Test' }, { database, user });
        expect(list.title).toBe('Test');
        expect(list.members[0]._id).toMatchId(user._id);
    });

    test('Provides clear error messages when invalid data provided', async () => {
        expect.assertions(2);
        const user = await createUser();
        try {
            await createList({ title: '' }, { database, user });
        } catch (err) {
            expect(err.name).toBe('ValidationError');
            expect(err.message).toBe('List validation failed: title: Path `title` is required.');
        }
    });

    test('Protects sensitive fields', async () => {
        expect.assertions(1);
        const user = await createUser();
        const list = await createList({ title: 'Evil Task', type: 'inbox' }, { database, user });
        expect(list.type).toBe('default');
    });

    test('Protects against non-member modification', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        const list = await createList({ title: 'Good List' }, { database, user: user1 });
        try {
            await updateList(list._id, { title: 'Malicious List' }, { database, user: user2 });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid List ID');
        }
    });

    test('Protects against fetching invalid list ID', async () => {
        expect.assertions(2);
        const user = await createUser();
        try {
            await createTask('INVALID_ID', { title: 'Good List' }, { database, user });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid List ID');
        }
    });

    test('Allows list to be modified', async () => {
        expect.assertions(1);
        const user = await createUser();
        const list = await createList({ title: 'OK List' }, { database, user });
        const updatedList = await updateList(list._id, { title: 'Good List' }, { database, user });
        expect(updatedList.title).toBe('Good List');
    });

    test('Allows list to be deleted', async () => {
        expect.assertions(1);
        const user = await createUser();
        const list = await createList({ title: 'Temp List' }, { database, user });
        const deletedList = await deleteList(list._id, { database, user });
        expect(deletedList.success).toBeTruthy();
    });

    test('Allows fetching multiple lists', async () => {
        expect.assertions(1);
        const user = await createUser();
        const randomNumber = Math.floor(Math.random() * 10) + 1; // random between 1 and 10
        for (let i of [...Array(randomNumber).keys()]) {
            await createList({ title: `List ${i}` }, { database, user });
        }
        const fetchedLists = await getLists(null, { database, user });
        expect(fetchedLists).toHaveLength(randomNumber + 1); // all created lists and inbox
    });

    test('Protects against fetching list non-member list', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        const list = await createList({ title: 'Good List' }, { database, user: user1 });
        try {
            await getLists(list._id, { database, user: user2 });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid List ID');
        }
    });

    test('Protects against non-member deletion', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        const list = await createList({ title: 'Good List' }, { database, user: user1 });
        try {
            await deleteList(list._id, { database, user: user2 });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid List ID');
        }
    });

    test('Allows members to be added to list', async () => {
        expect.assertions(1);
        const user1 = await createUser();
        const user2 = await createUser();
        let list = await createList({ title: 'Title' }, { database, user: user1 });
        await updateList(list._id, { members: [user1._id, user2._id] }, { database, user: user1 });
        list = await getLists(list._id, { database, user: user1 });
        expect(list.members.map(m => m._id)).toEqual(
            expect.arrayContaining([user1._id, user2._id])
        );
    });

    test('Protects against removing owner from list', async () => {
        expect.assertions(2);
        const user1 = await createUser();
        const user2 = await createUser();
        let list = await createList({ title: 'Title' }, { database, user: user1 });
        await updateList(list._id, { members: [user1._id, user2._id] }, { database, user: user1 });
        try {
            await updateList(list._id, { members: [user2._id] }, { database, user: user2 });
        } catch (err) {
            expect(err.name).toBe('ValidationError');
            expect(err.message).toBe(
                'List validation failed: members: Not permitted to remove owner!'
            );
        }
    });

    test('Allows lists tasks to be reordered', async () => {
        const user = await createUser();
        let list = await createList({ title: 'Test' }, { database, user });
        const task1 = await createTask(list._id, { title: 'Test 1' }, { database, user });
        const task2 = await createTask(list._id, { title: 'Test 2' }, { database, user });
        const task3 = await createTask(list._id, { title: 'Test 3' }, { database, user });
        list = await getLists(list._id, { database, user });
        const sanitizeId = task => task._id.toString();
        expect(list.tasks.map(sanitizeId)).toMatchObject([task3, task2, task1].map(sanitizeId));
        list = await updateList(
            list._id,
            {
                tasks: [task1, task2, task3].map(sanitizeId)
            },
            { database, user }
        );
        list = await getLists(list._id, { database, user });
        expect(list.tasks.map(sanitizeId)).toMatchObject([task1, task2, task3].map(sanitizeId));
    });

    test('Prevents tasks from being injected during reorder', async () => {
        const user = await createUser();
        let list = await createList({ title: 'Test' }, { database, user });
        const task1 = await createTask(list._id, { title: 'Good Task' }, { database, user });
        const task2 = await createTask(list._id, { title: 'Good Task' }, { database, user });
        const badTask = await createTask(
            (await createList({ title: 'Test' }, { database, user }))._id,
            { title: 'Bad Task' },
            { database, user }
        );
        try {
            await updateList(
                list._id,
                { tasks: [badTask._id.toString(), task1._id.toString()] },
                { database, user }
            );
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid modification of tasks');
        }
        list = await getLists(list._id, { database, user });
        expect(list.tasks).toHaveLength(2);
        expect(list.tasks[1]._id).toMatchId(task1._id);
        expect(list.tasks[0]._id).toMatchId(task2._id);
    });

    test('Prevents tasks from being removed during reorder', async () => {
        const user = await createUser();
        let list = await createList({ title: 'Test' }, { database, user });
        const task1 = (await createTask(list._id, { title: 'Good Task' }, { database, user }))._id;
        const task2 = (await createTask(list._id, { title: 'Good Task' }, { database, user }))._id;
        try {
            await updateList(list._id, { tasks: [task2] }, { database, user });
        } catch (err) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid modification of tasks');
        }
        list = await getLists(list._id, { database, user });
        expect(list.tasks).toHaveLength(2);
        expect(list.tasks[1]._id).toMatchId(task1._id);
        expect(list.tasks[0]._id).toMatchId(task2._id);
    });

    test('Requires that the colour be a valid hex code', async () => {
        expect.assertions(6);
        const user = await createUser();
        const props = { database, user };
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
            await ListSchema.create({
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
            const list = await ListSchema.findOne({});
            list.owner = '5b99d4d74a6df02dbddf9097'; // random valid id
            await list.save();
        } catch (err) {
            expect(err.message).toContain(
                'List validation failed: owner: Not permitted to modify owner!'
            );
        }
    });
});
