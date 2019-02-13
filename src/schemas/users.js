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
        lists: {
            type: Array,
            default: []
        }
    });

    const model = mongoose.model('User', schema);

    model.removeListFromUser = function(list_id, user) {
        let index = user.lists.findIndex(id => list_id.equals(id));
        if (index >= 0) {
            user.lists.splice(index, 1);
        }
        return user;
    };

    model.addListToUser = function(list_id, user) {
        if (!user.lists.find(id => list_id.equals(id))) {
            user.lists.unshift(list_id);
        }
        return user;
    };

    return model;
};
