const { ObjectId } = require('mongodb');
const tempUserId = ObjectId('5c736dd1dcc6d280d547dab4');
module.exports = {
    async up(db) {
        console.log(await db.collection('users').findOne({ _id: tempUserId }));
        let lists = await db
            .collection('lists')
            .find({ members: ObjectId('5c736dd1dcc6d280d547dab4') })
            .toArray();

        console.log(lists);
        lists = lists.map(id => id._id.toString());
        await db.collection('users').updateOne({ _id: tempUserId }, { $set: { lists } });
        console.log(await db.collection('users').findOne({ _id: tempUserId }));
    },

    down(db) {
        return db.collection('users').updateOne({ _id: tempUserId }, { $set: { lists: [] } });
    }
};
