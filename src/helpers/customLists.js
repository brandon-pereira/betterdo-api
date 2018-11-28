async function fetchHighPriority({ database, user }) {
    const tasks = await database.Tasks.find({
        priority: 'high'
    })
        .populate({
            path: 'list',
            select: 'members',
            match: { members: { $in: [user._id] } }
        })
        .exec();
    return tasks.filter(tasks => tasks.list);
}

async function fetchTasksWithinDates(lowest, highest, { user, database }) {
    const tasks = await database.Tasks.find({
        dueDate: {
            $gte: lowest,
            $lt: highest
        }
    })
        .populate({
            path: 'list',
            select: 'members',
            match: { members: { $in: [user._id] } }
        })
        .exec();
    return tasks.filter(tasks => tasks.list);
}

async function fetchTomorrow({ user, database }) {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(23, 59, 59, 999);
    return fetchTasksWithinDates(start, end, { user, database });
}

function fetchToday({ user, database }) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return fetchTasksWithinDates(start, end, { user, database });
}

module.exports = {
    fetchHighPriority,
    fetchTomorrow,
    fetchToday,
    fetchTasksWithinDates
};
