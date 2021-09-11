import { db, createUser } from './utils';
import { createTask } from '../src/controllers/tasks';
import { createList, updateList, getLists, deleteList } from '../src/controllers/lists';

let user1;
let user2;
let inbox;
let validList1;
let validList2;
beforeAll(async () => {
    user1 = await createUser();
    user2 = await createUser();
    inbox = await getLists('inbox', {}, { user: user1, db });
    validList1 = await createList({ title: 'Valid List' }, { db, user: user1 });
    validList2 = await createList({ title: 'Valid List' }, { db, user: user2 });
});

describe('Custom Lists API', () => {
    test("Inbox shouldn't allow modification", async () => {
        await updateList(inbox.id, { title: 'Malicious' }, { db, user: user1 });
        inbox = await getLists('inbox', {}, { user: user1, db });
        const result = await db(inbox.id, { db, user: user1 });
        expect(result.title).toBe('Inbox');
    });

    test("Inbox shouldn't allow deletion", async () => {
        expect.assertions(2);
        try {
            await deleteList(inbox.id, { db, user: user1 });
        } catch (err) {
            expect(err.message).toBe('Invalid List ID');
            expect(err.name).toBe('AccessError');
        }
    });

    test('Today list should only return valid tasks', async () => {
        let today = await getLists('today', {}, { db, user: user1 });
        expect(today.tasks).toHaveLength(0);
        await createTask(
            validList1.id,
            { title: 'Todo today!', dueDate: new Date() },
            { db, user: user1 }
        );
        today = await getLists('today', {}, { db, user: user1 });
        expect(today.tasks).toHaveLength(1);
    });

    test('Tomorrow list should only return valid tasks', async () => {
        let today = await getLists('tomorrow', {}, { db, user: user1 });
        expect(today.tasks).toHaveLength(0);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 30, 0, 0);
        await createTask(
            validList1.id,
            { title: 'Todo tomorrow!', dueDate: tomorrow },
            { db, user: user1 }
        );
        today = await getLists('tomorrow', {}, { db, user: user1 });
        expect(today.tasks).toHaveLength(1);
    });

    test('High priority list should only return valid tasks', async () => {
        await createTask(
            validList1.id,
            { title: 'Invalid because not high-priority' },
            { db, user: user1 }
        );
        await createTask(
            validList2.id,
            { title: 'Invalid because wrong user', priority: 'high' },
            { db, user: user2 }
        );
        await createTask(validList1.id, { title: 'Valid', priority: 'high' }, { db, user: user1 });
        const user1lists = await getLists('highPriority', {}, { db, user: user1 });
        expect(user1lists.tasks).toHaveLength(1);
    });

    test('Should allow creating high priority tasks from highPriority list', async () => {
        const task = await createTask('highPriority', { title: 'title' }, { db, user: user1 });
        expect(task.priority).toBe('high');
        const hpList = await getLists('highPriority', {}, { db, user: user1 });
        expect(hpList.tasks.map(t => t._id.toString())).toContain(task._id.toString());
        const inbox = await getLists('inbox', {}, { db, user: user1 });
        expect(inbox.tasks.map(t => t._id.toString())).toContain(task._id.toString());
    });

    test('Should allow creating tasks due today from today list', async () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const task = await createTask('today', { title: 'title' }, { db, user: user1 });
        expect(task.dueDate.toString()).toBe(now.toString());
        const list = await getLists('today', {}, { db, user: user1 });
        expect(list.tasks.map(t => t._id.toString())).toContain(task._id.toString());
        const inbox = await getLists('inbox', {}, { db, user: user1 });
        expect(inbox.tasks.map(t => t._id.toString())).toContain(task._id.toString());
    });

    test('Should allow creating tasks due tomorrow from tomorrow list', async () => {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        now.setHours(0, 0, 0, 0);
        const task = await createTask('tomorrow', { title: 'title' }, { db, user: user1 });
        expect(task.dueDate.toString()).toBe(now.toString());
        const list = await getLists('tomorrow', {}, { db, user: user1 });
        expect(list.tasks.map(t => t._id.toString())).toContain(task._id.toString());
        const inbox = await getLists('inbox', {}, { db, user: user1 });
        expect(inbox.tasks.map(t => t._id.toString())).toContain(task._id.toString());
    });

    test('Should allow returning additional tasks', async () => {
        const task = await createTask(
            'highPriority',
            { title: 'title', isCompleted: true },
            { db, user: user1 }
        );
        let list = await getLists('highPriority', {}, { db, user: user1 });
        expect(list.tasks.map(t => t._id.toString())).not.toContain(task._id.toString());
        expect(list.additionalTasks).toBe(1);
        expect(list.completedTasks).toHaveLength(0);
        list = await getLists(
            'highPriority',
            { includeCompleted: true },
            {
                db,
                user: user1
            }
        );
        expect(list.completedTasks.map(t => t._id.toString())).toContain(task._id.toString());
        expect(list.additionalTasks).toBe(0);
    });
});
