const { handleUncaughtError } = require('./errorHandler');

module.exports = async function(taskName = 'performing task', { res, database }, taskFn) {
    try {
        const json = await taskFn({ database });
        // We assume that if the taskFn function resolves, then we have a valid 200 response
        res.json(json);
    } catch (err) {
        handleUncaughtError(taskName, res, err);
    }
};
