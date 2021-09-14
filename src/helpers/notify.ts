import { List } from '../schemas/lists';
import { RouterOptions } from './routeHandler';

function notifyAboutSharedList(title: string, list: List, { notifier, user }: RouterOptions): void {
    const members = list.members;
    const listId = list._id;
    const isSharedList = members.length > 1;

    if (isSharedList) {
        members.map(async member => {
            if (!member._id.equals(user._id)) {
                await notifier.send(member._id, {
                    title,
                    url: `${process.env.SERVER_URL}/#/${listId}`,
                    tag: `shared-list:${listId}`,
                    data: {
                        listId: listId,
                        listTitle: list.title
                    }
                });
            }
        });
    }
}

export { notifyAboutSharedList };
