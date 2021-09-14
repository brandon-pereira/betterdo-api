import { ObjectId } from 'mongodb';
import { ListDocument } from '../schemas/lists';
import { Task, TaskDocument } from '../schemas/tasks';
import { RouterOptions } from './routeHandler';

const CUSTOM_LISTS = ['highPriority', 'today', 'tomorrow'];

function isCustomList(listId: ObjectId | string): boolean {
    if (typeof listId !== 'string') return false;
    return CUSTOM_LISTS.includes(listId);
}

async function fetchUserCustomLists({ db, user }: RouterOptions): Promise<Array<ListDocument>> {
    const listsPromise = Object.entries(user.customLists).map(([key, value]) =>
        value ? fetchCustomList(key, false, { db, user }) : null
    );
    return (await Promise.all(listsPromise)).filter(list => list);
}

async function fetchCustomList(
    listId: string,
    includeCompleted = false,
    opts: RouterOptions
): Promise<List | null> {
    // fetch list
    let list = null;
    if (listId === 'highPriority') {
        list = await fetchHighPriority(opts);
    } else if (listId === 'today') {
        list = await fetchToday(opts);
    } else if (listId === 'tomorrow') {
        list = await fetchTomorrow(opts);
    }
    // calculate completed tasks visible
    if (list && !includeCompleted) {
        list.completedTasks = [];
    } else if (list && includeCompleted) {
        list.additionalTasks = 0;
    }
    return list;
}

async function fetchHighPriority({ db, user }: RouterOptions): Promise<ListDocument> {
    const { completedTasks, tasks } = await fetchHighPriorityTasks({ db, user });
    const list = new db.Lists({
        title: 'High Priority',
        type: 'highPriority',
        completedTasks,
        tasks,
        members: [user._id],
        owner: user._id
    }).toObject();
    list._id = 'highPriority';
    list.id = 'highPriority';
    return list;
}
async function fetchTomorrow({ db, user }: RouterOptions): Promise<ListDocument> {
    const { completedTasks, tasks } = await fetchTomorrowTasks({ db, user });
    const list = new db.Lists({
        title: 'Tomorrow',
        type: 'tomorrow',
        completedTasks,
        tasks,
        members: [user._id],
        owner: user._id
    }).toObject();
    list._id = 'tomorrow';
    list.id = 'tomorrow';
    return list;
}
async function fetchToday({ db, user }: RouterOptions): Promise<ListDocument> {
    const { completedTasks, tasks } = await fetchTodayTasks({ db, user });
    const list = new db.Lists({
        title: 'Today',
        type: 'today',
        tasks,
        completedTasks,
        members: [user._id],
        owner: user._id
    }).toObject();
    list._id = 'today';
    list.id = 'today';
    return list;
}

async function fetchHighPriorityTasks({ db, user }: RouterOptions): Promise<ListDocument> {
    const tasks = await db.Tasks.find({
        priority: 'high'
    })
        .populate({
            path: 'list',
            select: 'members',
            match: { members: { $in: [user._id] } }
        })
        .exec();
    // Populate all created by
    await Promise.all(tasks.map(task => db.Tasks.populateTask(task)));
    return sortTasks(tasks);
}

function modifyTaskForCustomList(listId, taskObj) {
    if (listId === 'highPriority') {
        taskObj.priority = 'high';
    } else if (listId === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskObj.dueDate = today;
    } else if (listId === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        taskObj.dueDate = tomorrow;
    }
    return taskObj;
}

async function fetchTomorrowTasks({ user, db }: RouterOptions): Promise<ListDocument> {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(23, 59, 59, 999);
    return fetchTasksWithinDates(start, end, { user, db });
}

function fetchTodayTasks({ user, db }: RouterOptions): Promise<ListDocument> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return fetchTasksWithinDates(start, end, { user, db });
}

async function fetchTasksWithinDates(
    lowest: Date,
    highest: Date,
    { user, db }: RouterOptions
): Promise<Array<TaskDocument>> {
    const tasks = await db.Tasks.find({ dueDate: { $gte: lowest, $lt: highest } })
        .populate({ path: 'list', select: 'members', match: { members: { $in: [user._id] } } })
        .exec();
    // Populate all created by
    await Promise.all(tasks.map(task => db.Tasks.populateTask(task)));
    return sortTasks(tasks);
}

function sortTasks(unsortedTasks: Task[]): Task[] {
    return unsortedTasks
        .filter(tasks => tasks.list) // remove others lists
        .reduce(
            // return object with 2 arrays sorted by complete and incomplete
            (acc, curr) => {
                if (curr.isCompleted) {
                    acc.completedTasks.push(curr);
                } else {
                    acc.tasks.push(curr);
                }
                return acc;
            },
            { completedTasks: [], tasks: [] }
        );
}
export {
    isCustomList,
    fetchCustomList,
    fetchUserCustomLists,
    fetchHighPriority,
    fetchTomorrow,
    fetchToday,
    modifyTaskForCustomList
};
