module.exports.notifyAboutSharedList = (title, { notifier, user, list }) => {
    const members = list.members;
    const listId = list._id;
    const isSharedList = members.length > 1;

    if (isSharedList) {
        members.forEach(async member => {
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
};
