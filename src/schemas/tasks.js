const { Schema } = require('mongoose');

module.exports = mongoose => {
    const schema = new Schema({
        title: {
            type: String,
            required: true,
            maxlength: 100,
            minlength: 1
        },
        list: {
            type: Schema.Types.ObjectId,
            ref: 'List',
            required: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        dueDate: Date,
        notes: String,
        subtasks: [
            {
                title: {
                    type: String,
                    maxlength: 100,
                    minlength: 1
                },
                isComplete: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        priority: {
            type: String,
            default: 'normal',
            enum: ['low', 'normal', 'high']
        },
        creationDate: {
            type: Date,
            default: Date.now
        }
    });

    schema.pre('validate', function() {
        const nonEditableFields = ['creationDate', 'createdBy'];
        nonEditableFields.forEach(field => {
            if (!this.isNew && this.isModified(field)) {
                this.invalidate(field, `Not permitted to modify ${field}!`);
            }
        });
    });

    const model = mongoose.model('Task', schema);

    model.populateTask = async function(taskRef) {
        const userQueryData = ['_id', 'firstName', 'lastName', 'profilePicture'];
        return taskRef.populate('createdBy', userQueryData).execPopulate();
    };

    return model;
};
