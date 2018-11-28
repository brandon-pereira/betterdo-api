const countTasks = require('../helpers/countTasks');

async function init(listId = 'inbox', { database, user }) {
    let currentList = database.Lists.getLists(user._id, listId);
    let lists = database.Lists.getLists(user._id);
    [currentList, lists] = await Promise.all([currentList, lists]);
    if (currentList === null) {
        // user passed in invalid list
        currentList = await database.Lists.getLists(user._id, 'inbox');
    }
    const { completedTasks, incompleteTasks } = countTasks(currentList.tasks);
    currentList.tasks = incompleteTasks;
    currentList.additionalTasks = completedTasks.length;
    return {
        user,
        currentList,
        lists
    };
}

module.exports = init;
