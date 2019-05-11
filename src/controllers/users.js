const { throwError } = require('../helpers/errorHandler');

async function updateUser(dirtyUserProps = {}, { database, user, notifier }) {
    // Get user
    let userRef = await database.Users.findById(user._id);
    // Remove potentially harmful stuff
    let didUpdatePushSubscription = false;
    if (dirtyUserProps.pushSubscription && typeof dirtyUserProps.pushSubscription === 'string') {
        if (!userRef.pushSubscriptions.includes(dirtyUserProps.pushSubscription)) {
            didUpdatePushSubscription = true;
            userRef.pushSubscriptions.push(dirtyUserProps.pushSubscription);
        }
    }
    // Ensure tasks length matches and no new tasks injected
    if (
        dirtyUserProps.lists &&
        (!Array.isArray(dirtyUserProps.lists) ||
            dirtyUserProps.lists.length !== userRef.lists.length ||
            dirtyUserProps.lists.find(_id => !userRef.lists.map(id => id.toString()).includes(_id)))
    ) {
        throwError('Invalid modification of lists');
    } else if (dirtyUserProps.lists) {
        // Valid tasks, update order
        userRef.lists = dirtyUserProps.lists;
        // Don't merge below
        delete dirtyUserProps.lists;
    }
    // if (typeof dirtyUserProps.isBeta === 'boolean') {
    //     userRef.isBeta = dirtyUserProps.isBeta;
    // }
    if (typeof dirtyUserProps.isPushEnabled === 'boolean') {
        userRef.isPushEnabled = dirtyUserProps.isPushEnabled;
    }
    if (dirtyUserProps.customLists && typeof dirtyUserProps.customLists === 'object') {
        Object.assign(userRef.customLists, dirtyUserProps.customLists);
    }
    const stringsToCheck = ['firstName', 'lastName', 'email'];
    stringsToCheck.forEach(id => {
        if (typeof dirtyUserProps[id] === 'string') {
            userRef[id] = dirtyUserProps[id];
        }
    });
    // Save
    await userRef.save();
    // Send push notification
    if (didUpdatePushSubscription) {
        await notifier.send(user._id, {
            title: "You're subscribed!",
            body: 'Time to party!'
        });
    }
    // Return to front-end
    return userRef;
}

async function getUser(email, { database }) {
    let user = await database.Users.findOne({ email: email });
    if (user) {
        return {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName ? user.lastName.charAt(0) : null,
            email: user.email,
            profilePicture: user.profilePicture
        };
    } else {
        throwError('Invalid User Email');
    }
}

module.exports = {
    updateUser,
    getUser
};
