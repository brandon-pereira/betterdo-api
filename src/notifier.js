const { WebPushNotifications, MongoAdapter } = require('web-pushnotifications');

module.exports = (app, db) => {
    const getUserPushSubscription = async userId => {
        const user = await db.Users.findById(userId);
        return user.pushSubscriptions[0];
    };

    const notifier = new WebPushNotifications({
        vapidKeys: {
            publicKey: process.env.VAPID_PUBLIC_KEY,
            privateKey: process.env.VAPID_PRIVATE_KEY,
            email: process.env.VAPID_EMAIL
        },
        notificationDefaults: {
            badge: '/notification-badge.png',
            icon: '/android-chrome-192x192.png'
        },
        getUserPushSubscription,
        adapter: new MongoAdapter(db.connection)
    });

    // notifier.schedule(new Date(), 'a', {
    //     title: "It's now now!"
    // });

    return notifier;
};
