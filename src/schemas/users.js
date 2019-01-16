// const { Schema } = require('mongoose');
module.exports = mongoose => {
    const schema = mongoose.model('User', {
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
        pushSubscription: Object
    });

    return schema;
};
