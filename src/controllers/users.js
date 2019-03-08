const { throwError } = require('../helpers/errorHandler');

async function updateUser(dirtyUserProps = {}, { database, user, notifier }) {
    // Get user
    let userRef = await database.Users.findById(user._id);
    // Remove potentially harmful stuff
    if (dirtyUserProps.pushSubscription && typeof dirtyUserProps.pushSubscription === 'string') {
        if (!userRef.pushSubscriptions.includes(dirtyUserProps.pushSubscription)) {
            userRef.pushSubscriptions.push(dirtyUserProps.pushSubscription);
            // Attempt to send a push notification to test
            try {
                await notifier.send(user._id, {
                    title: "You're subscribed!",
                    body: 'Time to party!'
                });
                console.log('Successfully sent notification');
            } catch (err) {
                console.log('Failed to send notification to user. Push subscription corrupt.', err);
                userRef.pushSubscriptions.splice(-1, 1);
            }
        }
    }
    // if (typeof dirtyUserProps.isBeta === 'boolean') {
    //     userRef.isBeta = dirtyUserProps.isBeta;
    // }
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
