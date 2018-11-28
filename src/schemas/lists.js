const { Schema } = require('mongoose');

module.exports = mongoose => {
    const schema = new Schema({
        title: {
            type: String,
            required: true,
            maxlength: 100,
            minlength: 1
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        type: {
            type: String,
            default: 'default',
            enum: ['inbox', 'default']
        },
        tasks: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Task'
            }
        ],
        color: {
            type: String,
            default: '#666666',
            validate: {
                validator: function(v) {
                    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(v);
                },
                message: props => `${props.value} is not a hex color code!`
            }
        }
    });

    schema.pre('save', function() {
        this.members = [this.owner];
    });

    schema.pre('validate', function() {
        const nonEditableFields = ['owner', 'type'];
        nonEditableFields.forEach(field => {
            if (!this.isNew && this.isModified(field)) {
                this.invalidate(field, `Not permitted to modify ${field}!`);
            }
        });
    });

    const model = mongoose.model('List', schema);

    model.getLists = async function(user_id, list_id) {
        let lists = [];
        if (list_id === 'inbox') {
            lists = this.getUserInbox(user_id);
        } else if (list_id) {
            lists = this.getUserListById(user_id, list_id);
        } else if (user_id) {
            lists = this.getUserLists(user_id);
        }
        return lists;
    };

    model.getUserLists = async function(user_id) {
        return await this.find({
            members: user_id
        });
    };

    model.getUserInbox = async function(user_id) {
        return await this.findOne({
            type: 'inbox',
            members: user_id
        })
            .populate('tasks')
            .exec();
    };

    model.getUserListById = async function(user_id, list_id) {
        try {
            const userQueryData = ['_id', 'firstName', 'lastName'];
            return await this.findOne({
                _id: list_id,
                members: user_id
            })
                .populate('members', userQueryData)
                .populate('owner', userQueryData)
                .populate('tasks')
                .exec();
        } catch (err) {
            return null;
        }
    };

    model.addTaskToList = async function(task_id, list_id) {
        const list = await this.findOne({ _id: list_id });
        // See if show is in list
        if (!list.tasks.find(id => task_id.equals(id))) {
            // If it isn't add it
            list.tasks.push(task_id);
            // Save/return
            await list.save();
            return list;
        }
        return list;
    };

    model.removeTaskFromList = async function(task_id, list_id) {
        // Mongoose ID to string
        const list = await this.findOne({ _id: list_id });
        // Try removing show
        const index = list.tasks.findIndex(id => task_id.equals(id));
        // console.log(index, list.tasks);
        if (index >= 0) {
            // Remove Index
            list.tasks.splice(index, 1);
            // Save/return
            await list.save();
        }
        return list;
    };

    return model;
};
