module.exports.notifyAboutSharedList = (title, { notifier, list }) => {
    const members = list.members;
    const listId = list._id;
    const isSharedList = members.length > 1;

    if (isSharedList) {
        members.forEach(async member => {
            // if (member._id.toString() !== user._id.toString()) {
            const d = new Date();
            d.setMinutes(d.getMinutes() + 1);
            const id = await notifier.schedule(d, member._id, {
                title,
                url: `${process.env.SERVER_URL}/app/${listId}`,
                tag: `shared-list:${listId}`,
                data: {
                    listId: listId,
                    listTitle: list.title
                }
            });
            setTimeout(() => {
                console.log('HERE');
                notifier.cancelNotification(id);
            }, 5000);
        });
    }
};
