const { WebNotifier, MongoAdapter } = require('web-notifier');

module.exports = (app, db) => {
    const getUserPushSubscription = async userId => {
        const user = await db.Users.findById(userId);
        if (user.isPushEnabled) {
            return user.pushSubscriptions;
        }
        return [];
    };

    const removeUserPushSubscription = async (userId, subscription) => {
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
            badge: '/notification-badge.png',
            icon: '/android-chrome-192x192.png',
            url: '/'
        },
        getUserPushSubscription,
        removeUserPushSubscription,
        adapter: new MongoAdapter(db.connection)
    });

    // const id = notifier.schedule(new Date(), 'a', {
    //     title: "It's now now!"
    // });

    return notifier;
};
