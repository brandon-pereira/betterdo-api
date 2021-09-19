import { throwError } from '../helpers/errorHandler';
import { ObjectId } from 'mongodb';
import { RouterOptions } from '../helpers/routeHandler';
import { List, ListDocument } from '../schemas/lists';
import { isCustomList, fetchCustomList, fetchUserCustomLists } from '../helpers/customLists';
import { parseObjectID } from '../helpers/objectIds';

interface LooseObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export async function getLists(
    listId: ObjectId | string,
    { includeCompleted } = { includeCompleted: false },
    { db, user, notifier }: RouterOptions
): Promise<List | Array<List>> {
    // Get lists based on query data
    if (listId && isCustomList(listId)) {
        const customList = await fetchCustomList(listId as string, includeCompleted, {
            db,
            user,
            notifier
        });
        if (!customList) {
            throwError('Unknown error');
        }
    } else if (listId) {
        const list = await db.Lists.getList(user._id, listId);
        if (!list) {
            throwError('Invalid List ID');
        }
        if (includeCompleted) {
            await list
                .populate({
                    path: 'completedTasks',
                    populate: {
                        path: 'createdBy',
                        model: 'User',
                        select: ['_id', 'firstName', 'lastName', 'profilePicture']
                    }
                })
                .execPopulate();
        }
        return {
            type: list.type,
            owner: list.owner,
            additionalTasks: includeCompleted ? 0 : list.additionalTasks,
            completedTasks: includeCompleted ? list.completedTasks : [],
            color: list.color,
            _id: list._id,
            title: list.title,
            tasks: list.tasks,
            members: list.members
        };
    }
    const inbox = db.Lists.getUserInbox(user._id);
    const userLists = db.Users.getLists(user._id);
    const customLists = fetchUserCustomLists({ db, user, notifier });
    const [_inbox, _userLists, _customLists] = await Promise.all([inbox, customLists, userLists]);
    const lists: Array<ListDocument> = [_inbox, ..._userLists, ..._customLists];
    return lists.map(list => ({
        type: list.type,
        additionalTasks: list.additionalTasks,
        completedTasks: [],
        color: list.color,
        tasks: list.tasks,
        members: list.members,
        owner: list.owner,
        _id: list._id,
        title: list.title
    }));
}

export async function createList(
    listObj: LooseObject,
    { db, user }: RouterOptions
): Promise<ListDocument> {
    // Remove potentially harmful properties
    delete listObj.owner;
    delete listObj.members;
    delete listObj.type;
    // Attempt to create the list
    const list = await db.Lists.create({
        ...listObj,
        owner: user._id
    });
    // Add list to users array
    await db.Users.addListToUser(list._id, user);
    // Populate
    await db.Lists.populateList(list);
    // Return new list to front-end
    return list;
}

export async function updateList(
    listId: ObjectId | string,
    updatedList: LooseObject,
    { db, user }: RouterOptions
): Promise<List> {
    // Ensure list id is passed
    if (!listId) throwError('Invalid List ID');
    // Convert ListId to object if not
    if (typeof listId === 'string') {
        listId = parseObjectID(listId);
    }
    // Get list
    const list = await db.Lists.getUserListById(user._id, listId);
    // If no results, throw error
    if (!list) throwError('Invalid List ID');
    // If inbox, don't allow editing some fields
    if (list.type === 'inbox') {
        updatedList = { tasks: updatedList.tasks };
    }
    // Ensure tasks length matches and no new tasks injected
    if (
        updatedList.tasks &&
        (!Array.isArray(updatedList.tasks) ||
            updatedList.tasks.length !== list.tasks.length ||
            updatedList.tasks.find(
                _id => !list.tasks.map(task => task._id.toString()).includes(_id)
            ))
    ) {
        throwError('Invalid modification of tasks');
    } else if (updatedList.tasks) {
        // Valid tasks, update order
        list.tasks = updatedList.tasks;
        // Don't merge below
        delete updatedList.tasks;
    }
    // If members list changes
    if (updatedList.members && Array.isArray(updatedList.members)) {
        const currentMembers = list.members.map(member => member._id.toString());
        updatedList.members = updatedList.members.map(member => member.toString());
        const newMembers = updatedList.members.filter(
            (member: string) => !currentMembers.includes(member)
        );
        const removedMembers = currentMembers.filter(
            member => !updatedList.members.includes(member)
        );
        const addMembersPromise = Promise.all(
            newMembers.map(async (member: string) => {
                const user = await db.Users.findById(member);
                if (!user) throwError('Invalid modification of tasks');
                await db.Users.addListToUser(list._id, user);
            })
        );
        const removeMembersPromise = Promise.all(
            removedMembers.map(async member => {
                const user = await db.Users.findById(member);
                if (!user) throwError('Invalid modification of tasks');
                await db.Users.removeListFromUser(list._id, user);
            })
        );
        await Promise.all([addMembersPromise, removeMembersPromise]);
        list.members = updatedList.members;
        delete updatedList.members;
    }
    // Merge the lists.. validation on the model will handle errors
    Object.assign(list, updatedList);
    // Save the model
    await list.save();
    // Repopulate object
    await db.Lists.populateList(list);
    // Return list to front-end
    return list;
}

interface GenericStatus {
    success: boolean;
}
export async function deleteList(
    listId: ObjectId | string,
    { db, user }: RouterOptions
): Promise<GenericStatus> {
    // Ensure list id is passed
    if (!listId) throwError('Invalid List ID');
    // Convert ListId to object if not
    if (typeof listId === 'string') {
        listId = new ObjectId(listId);
    }
    // Get list (and ensure valid)
    const list = await db.Lists.findOne({
        _id: listId,
        members: user._id,
        type: 'default'
    });
    if (!list) {
        throwError('Invalid List ID');
    }
    // await list.populate('members').execPopulate();
    const status = await db.Lists.deleteOne({ _id: list._id });
    if (status && status.n && status.n > 0) {
        // Remove list to users array
        await Promise.all(
            list.members.map(async member => {
                const _user = await db.Users.findById(member);
                if (!_user) return;
                await db.Users.removeListFromUser(new ObjectId(listId), _user);
            })
        );
        // Return success message
        return { success: true };
    }
    throwError('Invalid List ID');
}
