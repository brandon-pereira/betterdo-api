import { ObjectId } from 'mongoose';
import { throwError } from '../helpers/errorHandler';
import { RouterOptions } from '../helpers/routeHandler';
import { User, UserDocument } from '../schemas/users';

interface LooseObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export async function updateUser(
    dirtyUserProps: LooseObject = {},
    { user: userRef, notifier }: RouterOptions
): Promise<UserDocument> {
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
        const idx = `${id}` as keyof User;
        if (
            dirtyUserProps[idx] &&
            userRef[idx] &&
            typeof dirtyUserProps[idx] === 'string' &&
            typeof userRef[idx] !== 'undefined'
        ) {
            //https://stackoverflow.com/a/58657194/7033335
            userRef[idx] = dirtyUserProps[idx] as never;
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

export async function getCurrentUser({ user }: RouterOptions): Promise<CurrentUser> {
    if (user) {
        return sanitizeCurrentUser(user);
    } else {
        throwError('Not Authenticated');
    }
}

export async function getUser(email: string, { db }: RouterOptions): Promise<OtherUser> {
    const user = await db.Users.findOne({ email: email });
    if (user) {
        return sanitizeOtherUser(user);
    } else {
        throwError('Invalid User Email');
    }
}

interface OtherUser {
    _id: ObjectId;
    firstName?: string;
    lastName?: string;
    email: string;
    profilePicture?: string;
}

interface CurrentUser extends OtherUser {
    customLists: User['customLists'];
    isBeta: User['isBeta'];
    isPushEnabled: User['isPushEnabled'];
    lastLogin: User['lastLogin'];
    creationDate: User['creationDate'];
    config: LooseObject;
}

function sanitizeCurrentUser(user: UserDocument): CurrentUser {
    // All the "otherUser" data plus additional
    const otherUser = sanitizeOtherUser(user);
    return {
        ...otherUser,
        customLists: user.customLists,
        isBeta: user.isBeta,
        isPushEnabled: user.isPushEnabled,
        lastLogin: user.lastLogin,
        creationDate: user.creationDate,
        lastName: user.lastName,
        config: {
            vapidKey: process.env.VAPID_PUBLIC_KEY
        }
    };
}

function sanitizeOtherUser(user: UserDocument): OtherUser {
    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName ? user.lastName.charAt(0) : undefined,
        email: user.email,
        profilePicture: user.profilePicture
    };
}
