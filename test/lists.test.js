const { setup, teardown, database, createUser } = require('./setup');
const { Lists } = database;

beforeAll(setup);
afterAll(teardown);

describe('Lists', () => {

    test('Can be created with valid data', async () => {
    expect.assertions(2);
    const tempUser = await createUser();
    const list = await Lists.create({
        title: 'Test',
        owner: tempUser._id
    });
    expect(list.title).toBe('Test');
    expect(list.members[0]._id).toBe(tempUser._id);
});

    test('Requires the `owner` property to be set', async () => {
        expect.assertions(1);
        try {
            await Lists.create({
                title: 'Test',
                owner: 'invalid_id'
            });
        } catch(err) {
            expect(err.message).toContain('List validation failed: owner: Cast to ObjectID failed');
        }
    });

    test('Requires the title to be valid length', async () => {
        expect.assertions(1);
        const tempUser = await createUser();
        try {
            await Lists.create({
                title: '',
                owner: tempUser._id
            })
        } catch(err) {
            expect(err.message).toBe("List validation failed: title: Path `title` is required.");
        }
    });

    test('Requires that the colour be a valid hex code', async () => {
        expect.assertions(4);
        const tempUser = await createUser();
        try {
            await Lists.create({
                title: 'test',
                owner: tempUser._id,
                color: 'red' // invalid.. must be hex
            })
        } catch(err) {
            expect(err.message).toBe("List validation failed: color: red is not a hex color code!");
        }
        try {
            await Lists.create({
                title: 'test',
                owner: tempUser._id,
                color: '#SSSSSS' // invalid.. must be valid hex
            })
        } catch(err) {
            expect(err.message).toBe("List validation failed: color: #SSSSSS is not a hex color code!");
        }
        const validColours = ['#FFF', '#FF00AA'];
        await Promise.all(validColours.map(async (color) => {
            const list = await Lists.create({
                title: 'test',
                owner: tempUser._id,
                color
            })
            expect(list.color).toBe(color);
        }))
    
    });
    
});