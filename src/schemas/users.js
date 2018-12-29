// const { Schema } = require('mongoose');
module.exports = mongoose => {
    const schema = mongoose.model('User', {
        google_id: String,
        firstName: {
            type: String,
            required: true
        },
        lastName: String,
        email: {
            type: String,
            required: true
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
        }
    });

    return schema;
};
