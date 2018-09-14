process.env.DATABASE_NAME = 'test';
const { app, db } = require('../index');

async function createDatabase() {
    // console.log(`create`, app, db);
}

async function destroyDatabase() {
    // console.log(`destroy`, app, db);
}

module.exports = {
    createDatabase,
    destroyDatabase,
    app,
    db
}