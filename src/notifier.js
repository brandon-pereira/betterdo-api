const { WebPushNotifications, MongoAdapter } = require('web-pushnotifications');

module.exports = (app, db) => {
    const vapidKeys = {
        publicKey: process.env.VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY,
        email: process.env.VAPID_EMAIL
    };

    const getUserPushSubscription = async userId => {
        const user = await db.Users.findById(userId);
        return user.pushSubscriptions[0];
    };

    const notifier = new WebPushNotifications({
        vapidKeys,
        getUserPushSubscription,
        adapter: new MongoAdapter(db.connection)
    });

    // notifier.schedule(new Date(), 'a', {
    //     title: "It's now now!"
    // });

    return notifier;
};
