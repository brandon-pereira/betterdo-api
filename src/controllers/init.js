const { getLists } = require('./lists');

async function init(listId = 'inbox', { database, user }) {
    let currentList = getLists(listId, { database, user }).catch(() => null);
    let lists = getLists(undefined, { database, user });
    [currentList, lists] = await Promise.all([currentList, lists]);
    if (currentList === null) {
        // user passed in invalid list
        currentList = await getLists('inbox', { database, user });
    }
    return {
        user,
        currentList,
        lists
    };
}

module.exports = init;
