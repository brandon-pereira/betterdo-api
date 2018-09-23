async function highPriority({ database, user }) {
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

module.exports = {
    highPriority
};
