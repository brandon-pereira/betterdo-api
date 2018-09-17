const { setup, teardown, database, createUser } = require('./setup');
const ListSchema = database.Lists;
const { createList } = require('../src/controllers/lists');
beforeAll(setup);
afterAll(teardown);

describe('Lists API', () => {
    test('Can be created with valid data', async () => {
        expect.assertions(2);
        const user = await createUser();
        const list = await createList({ title: 'Test' }, { database, user });
        expect(list.title).toBe('Test');
        expect(list.members[0]._id).toBe(user._id);
    });

    test('Provides clear error messages when invalid data provided', async () => {
        expect.assertions(2);
        const user = await createUser();
        try {
            await createList({ title: '' }, { database, user });
        } catch (err) {
            expect(err.name).toBe('ValidationError');
            expect(err.message).toBe(
                'List validation failed: title: Path `title` is required.'
            );
        }
    });

    test('Protects sensitive fields', async () => {
        expect.assertions(1);
        const user = await createUser();
        const list = await createList(
            { title: 'Evil Task', type: 'inbox' },
            { database, user }
        );
        expect(list.type).toBe('default');
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
            expect(err.message).toContain(
                'List validation failed: owner: Cast to ObjectID failed'
            );
        }
    });

    test('Requires the title to be valid length', async () => {
        expect.assertions(1);
        const tempUser = await createUser();
        try {
            await ListSchema.create({
                title: '',
                owner: tempUser._id
            });
        } catch (err) {
            expect(err.message).toBe(
                'List validation failed: title: Path `title` is required.'
            );
        }
    });

    test('Requires that the colour be a valid hex code', async () => {
        expect.assertions(4);
        const tempUser = await createUser();
        try {
            await ListSchema.create({
                title: 'test',
                owner: tempUser._id,
                color: 'red' // invalid.. must be hex
            });
        } catch (err) {
            expect(err.message).toBe(
                'List validation failed: color: red is not a hex color code!'
            );
        }
        try {
            await ListSchema.create({
                title: 'test',
                owner: tempUser._id,
                color: '#SSSSSS' // invalid.. must be valid hex
            });
        } catch (err) {
            expect(err.message).toBe(
                'List validation failed: color: #SSSSSS is not a hex color code!'
            );
        }
        const validColours = ['#FFF', '#FF00AA'];
        await Promise.all(
            validColours.map(async color => {
                const list = await ListSchema.create({
                    title: 'test',
                    owner: tempUser._id,
                    color
                });
                expect(list.color).toBe(color);
            })
        );
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
