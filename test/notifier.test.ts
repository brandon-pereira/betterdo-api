/* eslint-disable jest/no-commented-out-tests */
import createRouter from './helpers/createRouter';
import { updateUser } from '../src/controllers/users';
import { connect, disconnect } from '../src/database';

beforeAll(async () => {
    await connect();
});

afterAll(async () => {
    await disconnect();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Notifier', () => {
    describe('User', () => {
        test('tweaks user.isPushEnabled', async () => {
            const router = await createRouter();
            expect(router.notifier.send).not.toBeCalled();
            await updateUser({ isPushEnabled: false }, router);
            expect(router.notifier.send).toBeCalledTimes(1);
            const payload = (router.notifier.send as jest.Mock).mock.calls[0];
            expect(payload[0]).toBe(router.user._id);
            expect(payload[1].title).toBe("You're subscribed!");
        });

        test('tweaks user.pushSubscription', async () => {
            const router = await createRouter();
            expect(router.notifier.send).not.toBeCalled();
            const fakeSubscription = `${Math.random()}`;
            await updateUser({ pushSubscription: fakeSubscription }, router);
            expect(router.notifier.send).toBeCalledTimes(1);
            const payload = (router.notifier.send as jest.Mock).mock.calls[0];
            expect(payload[0]).toBe(router.user._id);
            expect(payload[1].title).toBe("You're subscribed!");
        });
    });

    // describe('Shared List', () => {
    //     test('adds task', async () => {});
    //     test('marks task completed', async () => {});
    //     test('updates task', async () => {});
    //     test('deletes task', async () => {});
    //     test('supports incremental updates?', async () => {});
    // });
});
