const WebPushNotifications = require('web-pushnotifications');

module.exports = (app, db) => {
    let notificationQueue = [];
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
        const id = Math.random();
        notificationQueue.push({
            id,
            date,
            userId,
            payload
        });
    };
    const fetchNotifications = date => {
        return notificationQueue.filter(notification => notification.date <= date);
    };
    const clearNotification = payload => {
        notificationQueue = notificationQueue.filter(noti => noti.id !== payload.id);
    };

    const notifier = new WebPushNotifications({
        vapidKeys,
        getUserPushSubscription,
        fetchNotifications,
        scheduleNotification,
        clearNotification
    });

    // notifier.schedule(new Date(), 'a', {
    //     title: "It's now now!"
    // });

    return notifier;
};
