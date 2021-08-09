import { App, Database } from './types';
import { WebNotifier, MongoAdapter } from 'web-notifier';

export default (app: App, db: Database) => {
    const getUserPushSubscription = async (userId: String) => {
        const user = await db.Users.findById(userId);
        if (user.isPushEnabled) {
            return user.pushSubscriptions;
        }
        return [];
    };

    const removeUserPushSubscription = async (userId: String, subscription: String) => {
        const user = await db.Users.findById(userId);
        const index = user.pushSubscriptions.indexOf(subscription);
        if (index !== -1) {
            user.pushSubscriptions.splice(index, 1);
        }
        user.save();
        return user.pushSubscriptions;
    };

    const notifier = new WebNotifier({
        vapidKeys: {
            publicKey: process.env.VAPID_PUBLIC_KEY,
            privateKey: process.env.VAPID_PRIVATE_KEY,
            email: process.env.VAPID_EMAIL
        },
        notificationDefaults: {
            badge: `${process.env.SERVER_URL}/app/notification-badge.png`,
            icon: `${process.env.SERVER_URL}/app/android-chrome-192x192.png`,
            url: `${process.env.SERVER_URL}/`
        },
        getUserPushSubscription,
        removeUserPushSubscription,
        adapter: new MongoAdapter(db.connection)
    });

    return notifier;
};
