const { setup, teardown, database, createUser } = require('./setup');
const TaskSchema = database.Tasks;
const {
    createTask,
    updateTask,
    deleteTask
} = require('../src/controllers/tasks');
const { createList } = require('../src/controllers/lists');
beforeAll(setup);
afterAll(teardown);

describe('Tasks API', () => {
    test('Can be created with valid data', async () => {
        expect.assertions(2);
        const user = await createUser();
        const list = await createList({ title: 'Test' }, { database, user });
        const task = await createTask(
            list._id,
            { title: 'Test' },
            { database, user }
        );
        expect(task.list).toBe(list._id);
        expect(task.title).toBe('Test');
    });

    test('Provides clear error messages when invalid data provided', async () => {
        expect.assertions(2);
        const user = await createUser();
        const list = await createList({ title: 'Test' }, { database, user });
        try {
            await createTask(
                list._id,
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

    // test('Protects sensitive fields', async () => {
    //     expect.assertions(1);
    //     const user = await createUser();
    //     const list = await createList(
    //         { title: 'Evil Task', type: 'inbox' },
    //         { database, user }
    //     );
    //     expect(list.type).toBe('default');
    // });

    // test('Protects against non-member modification', async () => {
    //     expect.assertions(2);
    //     const user1 = await createUser();
    //     const user2 = await createUser();
    //     const list = await createList(
    //         { title: 'Good List' },
    //         { database, user: user1 }
    //     );
    //     try {
    //         await updateList(
    //             list._id,
    //             { title: 'Malicious List' },
    //             { database, user: user2 }
    //         );
    //     } catch (err) {
    //         expect(err.code).toBe('AccessError');
    //         expect(err.message).toBe('Invalid List ID');
    //     }
    // });

    // test('Protects against non-member deletion', async () => {
    //     expect.assertions(2);
    //     const user1 = await createUser();
    //     const user2 = await createUser();
    //     const list = await createList(
    //         { title: 'Good List' },
    //         { database, user: user1 }
    //     );
    //     try {
    //         await deleteList(list._id, { database, user: user2 });
    //     } catch (err) {
    //         expect(err.code).toBe('AccessError');
    //         expect(err.message).toBe('Invalid List ID');
    //     }
    // });

    // test('Requires that the colour be a valid hex code', async () => {
    //     expect.assertions(6);
    //     const user = await createUser();
    //     const props = { database, user };
    //     const badColors = ['red', '#SSSSSS'];
    //     const goodColors = ['#FFF', '#FF00AA'];
    //     await Promise.all(
    //         goodColors.map(color =>
    //             createList({ title: 'test', color }, props).then(list =>
    //                 expect(list.color).toBe(color)
    //             )
    //         )
    //     );
    //     await Promise.all(
    //         badColors.map(color =>
    //             createList({ title: 'test', color }, props).catch(err => {
    //                 expect(err.name).toBe('ValidationError');
    //                 expect(err.message).toContain('hex');
    //             })
    //         )
    //     );
    // });
});

// describe('Tasks Schema', () => {
//     test('Requires the `owner` property to be set', async () => {
//         expect.assertions(1);
//         try {
//             await ListSchema.create({
//                 title: 'Test',
//                 owner: 'invalid_id'
//             });
//         } catch (err) {
//             expect(err.message).toContain(
//                 'List validation failed: owner: Cast to ObjectID failed'
//             );
//         }
//     });

//     test(`Doesn't allow modification of the 'owners' property`, async () => {
//         expect.assertions(1);
//         try {
//             const list = await ListSchema.findOne({});
//             list.owner = '5b99d4d74a6df02dbddf9097'; // random valid id
//             await list.save();
//         } catch (err) {
//             expect(err.message).toContain(
//                 'List validation failed: owner: Not permitted to modify owner!'
//             );
//         }
//     });
// });
