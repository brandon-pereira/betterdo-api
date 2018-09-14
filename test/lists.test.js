const { setup, teardown, database, createUser } = require('./setup');
const { Lists } = database;

beforeAll(setup);
afterAll(teardown);

test('Create a task', async () => {
    expect.assertions(2);
    const tempUser = await createUser();
    const list = await Lists.create({
        title: 'Test',
        owner: tempUser._id
    });
    expect(list.title).toBe('Test');
    expect(list.members[0]._id).toBe(tempUser._id);
});
