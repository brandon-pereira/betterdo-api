async function fetchHighPriority({ database, user }) {
    const { completedTasks, tasks } = await fetchHighPriorityTasks({ database, user });
    return new database.Lists({
        _id: 'highPriority',
        title: 'High Priority',
        type: 'highPriority',
        completedTasks,
        tasks,
        members: [user._id],
        owner: user._id
    });
}
async function fetchTomorrow({ database, user }) {
    const { completedTasks, tasks } = await fetchTomorrowTasks({ database, user });
    return new database.Lists({
        _id: 'tomorrow',
        title: 'Tomorrow',
        type: 'tomorrow',
        completedTasks,
        tasks,
        members: [user._id],
        owner: user._id
    });
}
async function fetchToday({ database, user }) {
    const { completedTasks, tasks } = await fetchTodayTasks({ database, user });
    return new database.Lists({
        id: 'today',
        title: 'Today',
        type: 'today',
        tasks,
        completedTasks,
        members: [user._id],
        owner: user._id
    });
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

async function fetchTasksWithinDates(lowest, highest, { user, database }) {
    const tasks = await database.Tasks.find({ dueDate: { $gte: lowest, $lt: highest } })
        .populate({ path: 'list', select: 'members', match: { members: { $in: [user._id] } } })
        .exec();
    return sortTasks(tasks);
}

async function fetchTomorrowTasks({ user, database }) {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setUTCHours(23, 59, 59, 999);
    return fetchTasksWithinDates(start, end, { user, database });
}

function fetchTodayTasks({ user, database }) {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);
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
    fetchHighPriority,
    fetchTomorrow,
    fetchToday
};
