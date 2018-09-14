const { createDatabase, destroyDatabase } = require('./setup');

beforeAll(async () => {
    console.log("BEFORE");
    await createDatabase();
})

afterAll(async () => {
    console.log("AFTER");
    await destroyDatabase();
});

test('adds 1 + 2 to equal 3', async () => {
    expect(1 + 1).toBe(2);
    return;
});