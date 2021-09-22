/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-try-expect */
import './helpers/toMatchObject';
import { db, createRouter } from './utils';
import { Document } from 'mongoose';
import { Notifier } from 'web-notifier';
import { updateUser, getUser, getCurrentUser } from '../src/controllers/users';
import { createList, updateList } from '../src/controllers/lists';

const { Users } = db;

describe('Users Schema', () => {
    test('Creates a user', async () => {
        expect.assertions(5);
        const _userData = {
            firstName: 'unitTest',
            email: `${Date.now()}-${Math.random()}@unitTests.com`
        };
        const userCache = await Users.create(_userData);
        expect(userCache.firstName).toBe(_userData.firstName);
        expect(userCache.isBeta).toBeFalsy();
        expect(userCache.lastName).toBeUndefined();
        const foundUser = await Users.findById(userCache._id);
        expect(foundUser).toBeDefined();
        expect(foundUser?.firstName).toBe(_userData.firstName);
    });

    test('Throws error if missing required fields', async () => {
        expect.assertions(2);
        try {
            const user = new Users({
                email: `${Date.now()}-${Math.random()}@unitTests.com`
            });
            await user.save();
        } catch (err: any) {
            expect(err.message).toBe(
                'User validation failed: firstName: Path `firstName` is required.'
            );
        }
        try {
            const user = new Users({
                firstName: 'unitTest'
            });
            await user.save();
        } catch (err: any) {
            expect(err?.message).toBe('User validation failed: email: Path `email` is required.');
        }
    });
});

describe('Users API', () => {
    test('Can be updated with valid data', async () => {
        const router = await createRouter();
        const { user } = router;
        await updateUser({ firstName: 'John' }, router);
        const userCache = await Users.findById(user._id);
        expect(userCache?.firstName).toBe('John');
    });

    test('Allows finding users with valid email', async () => {
        const router = await createRouter();
        const { user } = router;
        const returnedUsers = await getUser(user.email, router);
        const userCache = await Users.findById(user._id);
        expect(returnedUsers._id).toMatchId(userCache?._id);
    });

    test('Allows finding current user', async () => {
        const router = await createRouter();
        const { user } = router;
        const returnedUsers = await getCurrentUser(router);
        const userCache = await Users.findById(user._id);
        expect(returnedUsers._id).toMatchId(userCache?._id);
    });

    test('Allows global push subscription to be toggled', async () => {
        const router = await createRouter();
        const { user } = router;
        let userCache = await Users.findById(user._id);
        expect(userCache?.isPushEnabled).toBe(true);
        await updateUser({ isPushEnabled: false }, router);
        userCache = await Users.findById(userCache?._id);
        expect(userCache?.isPushEnabled).toBe(false);
    });

    test('Allows push subscriptions to be added', async () => {
        const router = await createRouter();
        const { user } = router;
        let userCache = await Users.findById(user._id);
        expect(userCache?.pushSubscriptions).toHaveLength(0);
        await updateUser({ pushSubscription: 'test1' }, router);
        userCache = await Users.findById(userCache?._id);
        expect(userCache?.pushSubscriptions).toEqual(expect.arrayContaining(['test1']));
        await updateUser({ pushSubscription: 'test2' }, router);
        await updateUser({ pushSubscription: 'test1' }, router);
        userCache = await Users.findById(userCache?._id);
        expect(userCache?.pushSubscriptions).toEqual(expect.arrayContaining(['test1', 'test2']));
        const notifier = router.notifier as any;
        expect(notifier.send.mock.calls.length).toBe(2);
    });

    test('Throws error finding users with invalid email', async () => {
        expect.assertions(2);
        const router = await createRouter();
        try {
            await getUser('fake@email.com', router);
        } catch (err: any) {
            expect(err?.name).toBe('AccessError');
            expect(err?.message).toBe('Invalid User Email');
        }
    });

    test('Allows custom lists to be modified', async () => {
        const router = await createRouter();
        const { user } = router;
        await updateUser(
            {
                customLists: {
                    tomorrow: true
                }
            },
            router
        );
        const userCache = await Users.findById(user._id);
        expect(userCache?.customLists).toMatchObject({
            highPriority: false,
            today: false,
            tomorrow: true
        });
    });

    test('Allows users lists to be reordered', async () => {
        const router = await createRouter();
        const { user } = router;
        const list1 = await createList({ title: 'Test 1' }, router);
        const list2 = await createList({ title: 'Test 2' }, router);
        const list3 = await createList({ title: 'Test 3' }, router);
        let userCache = await Users.findById(user._id);
        const sanitizeId = (doc: Document) => doc._id.toString();
        expect(userCache?.lists.map(sanitizeId)).toMatchObject(
            [list1, list2, list3].map(sanitizeId)
        );
        await updateUser(
            {
                lists: [list3, list2, list1].map(sanitizeId)
            },
            router
        );
        userCache = await Users.findById(user._id);
        expect(userCache?.lists.map(sanitizeId)).toMatchObject(
            [list3, list2, list1].map(sanitizeId)
        );
    });

    test('Prevents lists from being injected during reorder', async () => {
        const userRequest1 = await createRouter();
        const userRequest2 = await createRouter();
        const list1 = await createList({ title: 'Good' }, userRequest1);
        const list2 = await createList({ title: 'Good' }, userRequest1);
        const list3 = await createList({ title: 'BAD!' }, userRequest2);
        try {
            await updateUser({ lists: [list1._id.toString(), list3._id.toString()] }, userRequest1);
        } catch (err: any) {
            expect(err?.name).toBe('AccessError');
            expect(err?.message).toBe('Invalid modification of lists');
        }
        const userCache = await Users.findById(userRequest1.user._id);
        expect(userCache?.lists).toHaveLength(2);
        expect(userCache?.lists[0]._id).toMatchId(list1._id);
        expect(userCache?.lists[1]._id).toMatchId(list2._id);
    });

    test('Prevents lists from being removed during reorder', async () => {
        const router = await createRouter();
        const { user } = router;
        const list1 = await createList({ title: 'Good' }, router);
        const list2 = await createList({ title: 'Good' }, router);
        try {
            await updateUser({ lists: [list2] }, router);
        } catch (err: any) {
            expect(err.name).toBe('AccessError');
            expect(err.message).toBe('Invalid modification of lists');
        }
        const userCache = await Users.findById(user._id);
        expect(userCache?.lists).toHaveLength(2);
        expect(userCache?.lists[0]._id).toMatchId(list1._id);
        expect(userCache?.lists[1]._id).toMatchId(list2._id);
    });

    test('Allows members to be added to shared lists', async () => {
        const userRequest1 = await createRouter();
        const userRequest2 = await createRouter();
        const list = await createList({ title: 'Test' }, userRequest1);
        await updateList(
            list._id,
            { members: [userRequest1.user._id, userRequest2.user._id] },
            userRequest1
        );
        const cache1 = await Users.findById(userRequest1.user._id);
        const cache2 = await Users.findById(userRequest2.user._id);
        expect(cache1?.lists).toHaveLength(1);
        expect(cache2?.lists).toHaveLength(1);
    });

    test('Allows members to be removed from shared lists', async () => {
        const userRequest1 = await createRouter();
        const userRequest2 = await createRouter();
        const list = await createList({ title: 'Test' }, userRequest1);
        await updateList(
            list._id,
            { members: [userRequest1.user._id, userRequest2.user._id] },
            userRequest1
        );
        await updateList(list._id, { members: [userRequest1.user._id] }, userRequest1);
        const user1 = (await Users.findById(userRequest1.user._id))?.toObject();
        const user2 = (await Users.findById(userRequest2.user._id))?.toObject();
        expect(user1?.lists).toHaveLength(1);
        expect(user2?.lists).toHaveLength(0);
    });
});
