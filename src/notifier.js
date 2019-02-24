const WebPushNotifications = require('web-pushnotifications');

module.exports = (app, db) => {
    const notificationQueue = [];
    const vapidKeys = {
        publicKey: process.env.VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY,
        email: 'brandonpereiras@gmail.com'
    };
    const getUserPushSubscription = async userId => {
        const user = await db.Users.findById(userId);
        return user.pushSubscriptions[0];
    };
    const scheduleNotification = (date, userId, payload) => {
        notificationQueue.push({
            date,
            userId,
            payload
        });
    };
    const fetchNotifications = date => {
        return notificationQueue.filter(notification => notification.date <= date);
    };

    const notifier = new WebPushNotifications({
        vapidKeys,
        getUserPushSubscription,
        fetchNotifications,
        scheduleNotification
    });

    // notifier.schedule(new Date(), 'a', {
    //     title: "It's now now!"
    // });

    return notifier;
};
