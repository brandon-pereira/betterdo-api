module.exports.notifyAboutSharedList = (title, { notifier, list }) => {
    const members = list.members;
    const listId = list._id;
    const isSharedList = members.length > 1;
    if (isSharedList) {
        members.forEach(member => {
            if (member._id.toString() !== user._id.toString()) {
                notifier.send(member._id, {
                    title,
                url: `/${listId}`,
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
