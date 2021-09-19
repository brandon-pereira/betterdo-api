import { ObjectId } from 'mongoose';
import { throwError } from '../helpers/errorHandler';
import { RouterOptions } from '../helpers/routeHandler';

interface LooseObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export async function updateUser(
    dirtyUserProps: LooseObject = {},
    { user: userRef, notifier }: RouterOptions
) {
    // Get user
    // const userRef = await db.Users.findById(user._id);

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
        if (typeof dirtyUserProps[id] === 'string' && typeof userRef[id] !== 'undefined') {
            userRef[id] = dirtyUserProps[id];
        }
    });
    // Save
    await userRef.save();
    // Send push notification
    if (didUpdatePushSubscription) {
        await notifier.send(userRef._id, {
            title: "You're subscribed!",
            body: 'Time to party!'
        });
    }
    // Return to front-end
    return userRef;
}

export async function getCurrentUser({ user }) {
    if (user) {
        return sanitizeCurrentUser(user);
    } else {
        throwError('Not Authenticated');
    }
}

export async function getUser(email: string, { db }: RouterOptions): OtherUser {
    const user = await db.Users.findOne({ email: email });
    if (user) {
        return sanitizeOtherUser(user);
    } else {
        throwError('Invalid User Email');
    }
}

interface OtherUser {
    id: ObjectId;
    firstName: string;
    lastName?: string;
    email: string;
    profilePicture?: string;
}

function sanitizeCurrentUser(user) {
    // ALl the "otherUser" data plus additional
    const currentUser = sanitizeOtherUser(user);
    currentUser.customLists = user.customLists;
    currentUser.isBeta = user.isBeta;
    currentUser.isPushEnabled = user.isPushEnabled;
    currentUser.lastLogin = user.lastLogin;
    currentUser.creationDate = user.creationDate;
    currentUser.lastName = user.lastName;
    currentUser.config = {
        vapidKey: process.env.VAPID_PUBLIC_KEY
    };
    return currentUser;
}

function sanitizeOtherUser(user): OtherUser {
    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName ? user.lastName.charAt(0) : null,
        email: user.email,
        profilePicture: user.profilePicture
    };
}
