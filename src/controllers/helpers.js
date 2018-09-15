/**
 * Method for use in catch block. Will normalize
 * error messages and send them to the front-end.
 * @param {String} taskName all-lowercase
 * @param {Response} res response
 * @param {Error} err error stack
 */
function handleUncaughtError(taskName, res, err) {
    // ValidationError comes from Mongoose
    if(err.name === 'ValidationError') {
        res.status(500).json({
            error: `Error while ${taskName}`,
            details: err.message
        });
    } else if(err.code === 'AccessError') {
      res.status(404).json({
        error: err.message
    });
    } else {
        console.log('Unexpected Error:', taskName, err);
        throwError({error: `Unexpected error while ${taskName}`}, res)
    }
}

function throwError(msg, code = 'AccessError') {
    const error = new Error(msg);
    error.code = code;
    throw error;
}

module.exports = {
    handleUncaughtError,
    throwError
}