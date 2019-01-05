const CUSTOM_LISTS = ['highPriority', 'today', 'tomorrow'];

function isCustomList(listId) {
    return CUSTOM_LISTS.includes(listId);
}

async function fetchUserCustomLists({ database, user }) {
    const listsPromise = Object.entries(user.customLists).map(([key, value]) =>
        value ? fetchCustomList(key, false, { database, user }) : null
    );
    return (await Promise.all(listsPromise)).filter(list => list);
}

async function fetchCustomList(listId, includeCompleted = false, opts) {
    // fetch list
    let list = null;
    if (listId === 'highPriority') {
        list = await fetchHighPriority(opts);
    } else if (listId === 'today') {
        list = await fetchToday(opts);
    } else if (listId === 'tomorrow') {
        list = await fetchTomorrow(opts);
    }
    // calculate completed tasks visible
    if (!includeCompleted) {
        list.completedTasks = [];
    } else {
        list.additionalTasks = 0;
    }
    return list;
}

async function fetchHighPriority({ database, user }) {
    const { completedTasks, tasks } = await fetchHighPriorityTasks({ database, user });
    const list = new database.Lists({
        title: 'High Priority',
        type: 'highPriority',
        completedTasks,
        tasks,
        members: [user._id],
        owner: user._id
    }).toObject();
    list._id = 'highPriority';
    list.id = 'highPriority';
    return list;
}
async function fetchTomorrow({ database, user }) {
    const { completedTasks, tasks } = await fetchTomorrowTasks({ database, user });
    const list = new database.Lists({
        title: 'Tomorrow',
        type: 'tomorrow',
        completedTasks,
        tasks,
        members: [user._id],
        owner: user._id
    }).toObject();
    list._id = 'tomorrow';
    list.id = 'tomorrow';
    return list;
}
async function fetchToday({ database, user }) {
    const { completedTasks, tasks } = await fetchTodayTasks({ database, user });
    const list = new database.Lists({
        title: 'Today',
        type: 'today',
        tasks,
        completedTasks,
        members: [user._id],
        owner: user._id
    }).toObject();
    list._id = 'today';
    list.id = 'today';
    return list;
}

async function fetchHighPriorityTasks({ database, user }) {
    const tasks = await database.Tasks.find({
        priority: 'high'
    })
        .populate({
            path: 'list',
            select: 'members',
            match: { members: { $in: [user._id] } }
        })
        .exec();
    return sortTasks(tasks);
}

function modifyTaskForCustomList(listId, taskObj) {
    if (listId === 'highPriority') {
        taskObj.priority = 'high';
    } else if (listId === 'today') {
        taskObj.dueDate = new Date();
    } else if (listId === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        taskObj.dueDate = tomorrow;
    }
    return taskObj;
}

async function fetchTasksWithinDates(lowest, highest, { user, database }) {
    const tasks = await database.Tasks.find({ dueDate: { $gte: lowest, $lt: highest } })
        .populate({ path: 'list', select: 'members', match: { members: { $in: [user._id] } } })
        .exec();
    return sortTasks(tasks);
}

async function fetchTomorrowTasks({ user, database }) {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(23, 59, 59, 999);
    return fetchTasksWithinDates(start, end, { user, database });
}

function fetchTodayTasks({ user, database }) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return fetchTasksWithinDates(start, end, { user, database });
}

function sortTasks(unsortedTasks) {
    return unsortedTasks
        .filter(tasks => tasks.list) // remove others lists
        .reduce(
            // return object with 2 arrays sorted by complete and incomplete
            (acc, curr) => {
                if (curr.isCompleted) {
                    acc.completedTasks.push(curr);
                } else {
                    acc.tasks.push(curr);
                }
                return acc;
            },
            { completedTasks: [], tasks: [] }
        );
}

module.exports = {
    isCustomList,
    fetchCustomList,
    fetchUserCustomLists,
    fetchHighPriority,
    fetchTomorrow,
    fetchToday,
    modifyTaskForCustomList
};
