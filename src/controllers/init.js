async function init({ database, user }) {
    let inbox = database.Lists.getLists(user._id, 'inbox');
    let lists = database.Lists.getLists(user._id);
    [inbox, lists] = await Promise.all([inbox, lists]);
    return {
        user,
        inbox,
        lists
    };
}

module.exports = init;
