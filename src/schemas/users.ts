import { model, Schema } from 'mongoose';
import { ObjectId, User, UserDocument, UserModel } from '../types';

const UserSchema = new Schema<UserDocument>({
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
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
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

UserSchema.statics.getLists = async function(userId: ObjectId) {
    const user = await this.findById(userId);
    await user.populate('lists').execPopulate();
    return user.lists;
};

const User = model<UserDocument, UserModel>('User', UserSchema);

// user.removeListFromUser = async function(listId: ObjectId, _user: UserDocument) {
//     let index = _user.lists.findIndex((id: string) => listId.equals(id));
//     if (index >= 0) {
//         _user.lists.splice(index, 1);
//         await _user.save();
//     }
//     return _user;
// };

// user.addListToUser = async function(listId: ObjectId, _user: UserDocument) {
//     if (!_user.lists.find((id: string) => listId.equals(id))) {
//         _user.lists.push((listId as unknown) as string);
//         await _user.save();
//     }
//     return _user;
// };

export default User;
