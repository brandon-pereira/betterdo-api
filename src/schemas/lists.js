const { Schema } = require('mongoose');

module.exports = mongoose => {
    const schema = new Schema(
        {
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
                enum: ['inbox', 'today', 'tomorrow', 'highPriority', 'default']
            },
            tasks: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Task'
                }
            ],
            completedTasks: [
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
        },
        {
            toObject: { virtuals: true },
            toJSON: { virtuals: true }
        }
    );

    schema.virtual('additionalTasks').get(function() {
        return this.completedTasks ? this.completedTasks.length : 0;
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
        // .lean()
        // .exec();
    };

    model.getUserInbox = async function(user_id) {
        const userQueryData = ['_id', 'firstName', 'lastName'];
        return await this.findOne({
            type: 'inbox',
            members: user_id
        })
            .populate('tasks')
            .populate('members', userQueryData)
            .populate('owner', userQueryData)
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

    model.addTaskToList = async function(task, list_id) {
        // Find lists
        const list = await this.findOne({ _id: list_id });
        // Add task to appropriate list
        if (!task.isCompleted) {
            this._addTaskToTasksList(task._id, list);
        } else {
            this._addTaskToCompletedTasksList(task._id, list);
        }
        // Save/return
        await list.save();
        return list;
    };

    model.removeTaskFromList = async function(task, list_id) {
        // Find list
        const list = await this.findOne({ _id: list_id });
        // Remove from lists
        this._removeTaskFromTasksList(task._id, list);
        this._removeTaskFromCompletedTasksList(task._id, list);
        // Save/return
        await list.save();
        return list;
    };

    model.setTaskCompleted = async function(task, list_id) {
        // Find list
        const list = await this.findOne({ _id: list_id });
        // Remove from lists
        this._removeTaskFromTasksList(task._id, list);
        this._addTaskToCompletedTasksList(task._id, list);
        // Save/return
        await list.save();
        return list;
    };

    model.setTaskIncompleted = async function(task, list_id) {
        // Find list
        const list = await this.findOne({
            _id: list_id
        });
        // Remove from lists
        this._removeTaskFromCompletedTasksList(task._id, list);
        this._addTaskToTasksList(task._id, list);
        // Save/return
        await list.save();
        return list;
    };

    model._removeTaskFromCompletedTasksList = function(task_id, list) {
        let index = list.completedTasks.findIndex(id => task_id.equals(id));
        // Remove from completed tasks
        if (index >= 0) {
            list.completedTasks.splice(index, 1);
        }
        return list;
    };

    model._removeTaskFromTasksList = function(task_id, list) {
        let index = list.tasks.findIndex(id => task_id.equals(id));
        // Remove from tasks
        if (index >= 0) {
            list.tasks.splice(index, 1);
        }
        return list;
    };

    model._addTaskToCompletedTasksList = function(task_id, list) {
        if (!list.completedTasks.find(id => task_id.equals(id))) {
            list.completedTasks.unshift(task_id);
        }
    };

    model._addTaskToTasksList = function(task_id, list) {
        if (!list.tasks.find(id => task_id.equals(id))) {
            list.tasks.unshift(task_id);
        }
    };

    return model;
};
