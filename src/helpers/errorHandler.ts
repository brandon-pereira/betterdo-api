import { Response } from 'express';

/**
 * Method for use in catch block. Will normalize
 * error messages and send them to the front-end.
 * @param {String} taskName all-lowercase
 * @param {Response} res response
 * @param {Error} err error stack
 */
export function handleUncaughtError(taskName: string, res: Response, err: Error) {
    // ValidationError comes from Mongoose
    if (err.name === 'ValidationError') {
        res.status(500).json({
            error: `Error while ${taskName}`,
            details: err.message
        });
    } else if (err.name === 'AccessError') {
        res.status(404).json({
            error: err.message
        });
    } else if (err.name === 'PermissionError') {
        res.status(403).json({
            error: err.message
        });
    } else {
        console.error(`UnhandledError while ${taskName}`, err);
        res.status(500).json({
            error: `Unexpected error while ${taskName}`
        });
    }
}

export function throwError(msg: string, code = 'AccessError') {
    const error = new Error(msg);
    error.name = code;
    throw error;
}
