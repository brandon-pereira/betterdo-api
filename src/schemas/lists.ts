import { Model, model, Schema } from 'mongoose';
import { List, ObjectId, ListDocument, ListModel } from '../types';

const ListSchema = new Schema<ListDocument, ListModel>(
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
                validator: (value: string) => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value),
                message: (props: any) => `${props.value} is not a hex color code!`
            }
        }
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

// schema.virtual('additionalTasks').get(function(this: any) {
//     return this.completedTasks ? this.completedTasks.length : 0;
// });

// schema.pre('save', function(this: any) {
//     if (this.isNew) {
//         this.members = [this.owner];
//     }
// });

// schema.pre('validate', function(this: any) {
//     const nonEditableFields = ['owner', 'type'];
//     nonEditableFields.forEach(field => {
//         if (!this.isNew && this.isModified(field)) {
//             this.invalidate(field, `Not permitted to modify ${field}!`);
//         }
//     });

//     if (
//         !this.isNew &&
//         this.isModified('members') &&
//         !this.members.find(member => member._id.equals(this.owner))
//     ) {
//         this.invalidate('members', `Not permitted to remove owner!`);
//     }
// });

ListSchema.statics.getList = async function(user_id: ObjectId, list_id: ObjectId | string) {
    if (list_id === 'inbox') {
        return this.getUserInbox(user_id);
    } else if (list_id) {
        try {
            const _list = await this.findOne({
                _id: list_id,
                members: user_id.toString()
            });
            if (_list) {
                console.log(this.getList);
                return this.populateList(_list);
            } else {
                throw new Error('Invalid List ID');
            }
        } catch (err) {
            console.log(err);
            return null;
        }
    } else {
        throw new Error('Missing List ID');
    }
};

ListSchema.statics.populateList = async function(list: ListDocument) {
    if (!list) {
        return null;
    }
    const userQueryData = ['_id', 'firstName', 'lastName', 'profilePicture'];
    return (
        list
            // .populate({
            //     path: 'tasks',
            //     populate: {
            //         path: 'createdBy',
            //         model: 'User',
            //         select: userQueryData
            //     }
            // })
            .populate({ path: 'members', select: userQueryData })
            .execPopulate()
    );
};

ListSchema.statics.getUserInbox = async function(user_id: ObjectId) {
    return this.populateList(
        await this.findOne({
            type: 'inbox',
            members: user_id.toString()
        })
    );
};

ListSchema.statics.getUserListById = async function(user_id: ObjectId, list_id: ObjectId) {
    try {
        return this.populateList(
            await this.findOne({
                _id: list_id,
                members: user_id.toString()
            })
        );
    } catch {
        return null;
    }
};

// schema.statics.addTaskToList = async function(task: Task, list_id: ObjectId) {
//     // Find lists
//     const _list = await List.findOne({ _id: list_id });
//     // Add task to appropriate list
//     if (!task.isCompleted) {
//         List.addTaskToTasksList(task.id, _list);
//     } else {
//         List.addTaskToCompletedTasksList(task.id, _list);
//     }
//     // Save/return
//     await _List.save();
//     return _list;
// };

// schema.statics.removeTaskFromList = async function(task: Task, list_id: ObjectId) {
//     // Find list
//     const _list = await List.findOne({ _id: list_id });
//     // Remove from lists
//     _List.removeTaskFromTasksList(task.id, list);
//     _List.removeTaskFromCompletedTasksList(task.id, list);
//     // Save/return
//     await _List.save();
//     return _list;
// };

// schema.statics.setTaskComplete = async function(task: Task, list_id: ObjectId) {
//     // Find list
//     const _list: ListDocument = await List.findOne({ _id: list_id });
//     // Remove from lists
//     List.removeTaskFromTasksList(task.id, list);
//     List.addTaskToCompletedTasksList(task.id, list);
//     // Save/return
//     await _List.save();
//     return _list;
// };

// schema.statics.setTaskIncomplete = async function(task: Task, list_id: ObjectId) {
//     // Find list
//     const _list = await List.findOne({
//         _id: list_id
//     });
//     // Remove from lists
//     _list.removeTaskFromCompletedTasksList(task.id, list);
//     _list.addTaskToTasksList(task.id, list);
//     // Save/return
//     await _list.save();
//     return _list;
// };

// schema.statics.removeTaskFromCompletedTasksList = function(task_id: ObjectId, _list: ListDocument) {
//     let index = _List.completedTasks.findIndex((id: string) => task_id.equals(id));
//     // Remove from completed tasks
//     if (index >= 0) {
//         _List.completedTasks.splice(index, 1);
//     }
//     return _list;
// };

// schema.statics.removeTaskFromTasksList = function(task_id: ObjectId, list: ListDocument) {
//     let index = List.tasks.findIndex((id: string) => task_id.equals(id));
//     // Remove from tasks
//     if (index >= 0) {
//         List.tasks.splice(index, 1);
//     }
//     return list;
// };

// schema.statics.addTaskToCompletedTasksList = function(task_id: ObjectId, list: ListDocument) {
//     if (!List.completedTasks.find((id: string) => task_id.equals(id))) {
//         List.completedTasks.unshift((task_id as unknown) as string);
//     }
// };

// schema.statics.addTaskToTasksList = function(task_id: ObjectId, list: ListDocument) {
//     if (!List.tasks.find((id: string) => task_id.equals(id))) {
//         List.tasks.unshift((task_id as unknown) as string);
//     }
// };

const List: ListModel = model<ListDocument, ListModel>('List', ListSchema);

export default List;
