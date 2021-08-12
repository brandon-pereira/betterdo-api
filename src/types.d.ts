import { Application } from 'express';
import { connection, Document, PopulatedDoc, Model } from 'mongoose';
import mongodb from 'mongodb';
import { Notifier } from 'web-notifier';
export { ObjectId } from 'mongodb';

export interface Database {
    connection: typeof connection;
    Users: UserModel;
    Lists: ListModel;
    // Tasks: any;
}

export interface App extends Application {}

declare global {
    declare namespace Express {
        export interface Request {
            user?: UserDocument;
        }
    }
}
export interface List {
    id: ObjectId;
    title: string;
    tasks: Array<PopulatedDoc<Task & Document>>;
    completedTasks: Array<string>;
    members: Array<string>;
    owner: PopulatedDoc<User & Document>;
}

export interface Task {
    id: ObjectId | string;
    isCompleted: boolean;
}

// User
export interface User {
    id: String;
    email: string;
    firstName: string;
    lastName: string;
    lists: Array<PopulatedDoc<List & Document>>;
    isPushEnabled: boolean;
    pushSubscriptions: Array<string>;
}

export interface UserDocument extends User, Document {
    getLists(): Promise<Array<List>>;
    removeListFromUser?(listId: ObjectId, user: User): Promise<User>;
    addListToUser?(listId: ObjectId, user: User): Promise<User>;
}

export interface UserModel extends Model<UserDocument> {}

export interface ListBaseDocument extends List, Document {}

export interface ListDocument extends ListBaseDocument {
    getLists(): Promise<Array<List | String>>;
    removeListFromUser?(listId: ObjectId, user: User): Promise<User>;
    addListToUser?(listId: ObjectId, user: User): Promise<User>;
}

export interface ListModel extends Model<ListDocument> {
    getList(userId: ObjectId, listId: ObjectId): Promise<ListDocument>;
    removeListFromUser(listId: ObjectId, user: User): Promise<User>;
    addListToUser(listId: ObjectId, user: User): Promise<User>;
    getUserInbox(userId: ObjectId): Promise<ListDocument>;
    getUserListById(userId: ObjectId, listId: ObjectId): Promise<ListDocument>;
    populateList(list: ListDocument | null): Promise<ListDocument>;
    addTaskToList(task: TaskDocument, listId: ObjectId): Promise<ListDocument>;
    removeTaskFromList(task: TaskDocument, listId: ObjectId): Promise<ListDocument>;
    setTaskComplete(task: TaskDocument, listId: ObjectId): Promise<ListDocument>;
    setTaskIncomplete(task: TaskDocument, listId: ObjectId): Promise<ListDocument>;
    removeTaskFromCompletedTasksList(taskId: ObjectId, list: ListDocument): ListDocument;
    removeTaskFromTasksList(taskId: ObjectId, list: ListDocument): ListDocument;
    addTaskToCompletedTasksList(taskId: ObjectId, list: ListDocument): void;
    addTaskToTasksList(taskId: ObjectId, list: ListDocument): void;
}
