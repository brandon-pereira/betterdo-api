module.exports.notifyAboutSharedList = (title, { notifier, members, user }) => {
    const isSharedList = members.length > 1;
    if (isSharedList) {
        members.forEach(member => {
            if (member._id.toString() !== user._id.toString()) {
                notifier.send(member._id, {
                    title,
                    isSharedListUpdateNotification: true
                });
            }
        });
    }
};
