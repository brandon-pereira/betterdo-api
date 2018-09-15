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
    } else {
        console.log('Unexpected Error:', taskName, err);
        res.status(500).json({error: `Unexpected error while ${taskName}`})
    }
}

module.exports = {
    handleUncaughtError
}