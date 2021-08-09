import { connection } from 'mongoose';
import { Application } from 'express';
import { Document, Model } from 'mongoose';

import mongodb from 'mongodb';

export { ObjectId } from 'mongodb';

export interface Database {
    connection: typeof connection;
    Users: UserModel;
    Lists: any;
    // Tasks: any;
}

export interface App extends Application {}

export interface List {
    id: ObjectId;
    tasks: Array<string>;
    completedTasks: Array<string>;
    members: Array<string>;
    owner: string;
}

export interface Task {
    id: ObjectId | string;
    isCompleted: boolean;
}

export interface User {
    email: string;
    firstName: string;
    lastName: string;
    lists: Array<string>;
    isPushEnabled: boolean;
    pushSubscriptions: Array<string>;
}

export interface ListBaseDocument extends List, Document {}

export interface ListDocument extends ListBaseDocument {}
export interface UserDocument extends User, Document {
    lists: Array<string>;
}

export interface UserModel extends Model<UserDocument> {
    getLists(userId: ObjectId): Promise<Array<List | String>>;
    removeListFromUser?(listId: ObjectId, user: User): Promise<User>;
    addListToUser?(listId: ObjectId, user: User): Promise<User>;
}

export interface ListModel extends Model<ListDocument> {
    getLists(userId: ObjectId): Promise<Array<List>>;
    getList(userId: ObjectId, listId: ObjectId): Promise<ListDocument>;
    removeListFromUser(listId: ObjectId, user: User): Promise<User>;
    addListToUser(listId: ObjectId, user: User): Promise<User>;
    getUserInbox(userId: ObjectId): Promise<ListDocument>;
    getUserListById(userId: ObjectId, listId: ObjectId): Promise<ListDocument>;
    populateList(list: ListDocument): Promise<ListDocument>;
    addTaskToList(task: TaskDocument, listId: ObjectId): Promise<ListDocument>;
    removeTaskFromList(task: TaskDocument, listId: ObjectId): Promise<ListDocument>;
    setTaskComplete(task: TaskDocument, listId: ObjectId): Promise<ListDocument>;
    setTaskIncomplete(task: TaskDocument, listId: ObjectId): Promise<ListDocument>;
    removeTaskFromCompletedTasksList(taskId: ObjectId, list: ListDocument): ListDocument;
    removeTaskFromTasksList(taskId: ObjectId, list: ListDocument): ListDocument;
    addTaskToCompletedTasksList(taskId: ObjectId, list: ListDocument): void;
    addTaskToTasksList(taskId: ObjectId, list: ListDocument): void;
}
