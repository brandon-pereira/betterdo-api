const { throwError } = require('../helpers/errorHandler');

async function updateUser(dirtyUserProps = {}, { database, user }) {
    // Get user
    let userRef = await database.Users.findById(user._id);
    // Remove potentially harmful stuff
    if (typeof dirtyUserProps.isBeta === 'boolean') {
        userRef.isBeta = dirtyUserProps.isBeta;
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
