const { handleUncaughtError } = require('./errorHandler');

module.exports = async function(
    taskName = 'performing task',
    { res, req, database, notifier },
    taskFn
) {
    try {
        const json = await taskFn({
            notifier,
            database,
            user: req.user
        });
        // We assume that if the taskFn function resolves, then we have a valid 200 response
        res.json(json);
    } catch (err) {
        handleUncaughtError(taskName, res, err);
    }
};
