async function init(listId = 'inbox', { database, user }) {
    let currentList = database.Lists.getLists(user._id, listId);
    let lists = database.Lists.getLists(user._id);
    [currentList, lists] = await Promise.all([currentList, lists]);
    return {
        user,
        currentList,
        lists
    };
}

module.exports = init;
