module.exports = {
    async up(db) {
        const _users = db.collection('users');
        const _lists = db.collection('lists');
        const users = await _users.find({}).toArray();
        const updateUsers = users.map(async user => {
            let userLists = await _lists
                .find({
                    members: user._id,
                    type: 'default'
                })
                .toArray();
            userLists = userLists.map(id => id._id.toString());
            await _users.updateOne({ _id: user._id }, { $set: { lists: userLists } });
        });
        await Promise.all(updateUsers);
    },

    down(db) {
        return db.collection('users').updateMany({}, { $set: { lists: [] } });
    }
};
