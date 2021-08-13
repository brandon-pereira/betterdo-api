import { Application } from 'express';
import { WebNotifier, MongoAdapter } from 'web-notifier';
import { Database } from './database';

export default (app: Application, db: Database): WebNotifier => {
    const getUserPushSubscription = async (userId: string) => {
        const user = await db.Users.findById(userId);
        if (user && user.isPushEnabled) {
            return user.pushSubscriptions;
        }
        return [];
    };

    const removeUserPushSubscription = async (userId: string, subscription: string) => {
        const user = await db.Users.findById(userId);
        if (!user) return [];
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
