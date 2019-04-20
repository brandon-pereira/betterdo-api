const { Schema } = require('mongoose');

module.exports = mongoose => {
    const schema = new Schema({
        google_id: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        firstName: {
            type: String,
            required: true,
            maxlength: 100,
            minlength: 1
        },
        lastName: {
            type: String,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please fill a valid email address'
            ]
        },
        creationDate: {
            type: Date,
            default: Date.now
        },
        profilePicture: String,
        lastLogin: {
            type: Date,
            default: Date.now
        },
        isBeta: {
            type: Boolean,
            default: false
        },
        isPushEnabled: {
            type: Boolean,
            default: true
        },
        customLists: {
            highPriority: {
                type: Boolean,
                default: true
            },
            today: {
                type: Boolean,
                default: true
            },
            tomorrow: {
                type: Boolean,
                default: false
            }
        },
        lists: [
            {
                type: Schema.Types.ObjectId,
                ref: 'List'
            }
        ],
        pushSubscriptions: [
            {
                type: String,
                required: true
            }
        ]
    });

    const model = mongoose.model('User', schema);

    model.getLists = async function(userId) {
        const user = await model.findById(userId);
        await user.populate('lists');
        return user.lists;
    };

    model.removeListFromUser = async function(list_id, user) {
        let index = user.lists.findIndex(id => list_id.equals(id));
        if (index >= 0) {
            user.lists.splice(index, 1);
        }
        await user.save();
        return user;
    };

    model.addListToUser = async function(list_id, user) {
        if (!user.lists.find(id => list_id.equals(id))) {
            user.lists.push(list_id);
        }
        await user.save();
        return user;
    };

    return model;
};
