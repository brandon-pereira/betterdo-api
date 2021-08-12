import { Request, Application, Response } from 'express';
import { App, Database, UserDocument } from '../types';
import { Notifier } from 'web-notifier';
import { handleUncaughtError } from './errorHandler';

export interface Router {
    db: Database;
    notifier: Notifier;
    user: UserDocument;
}

interface RouteHandlerOptions {
    res: Response;
    req: Request;
    db: Database;
    notifier: Notifier;
}

export default async function(
    taskName: string = 'performing task',
    { res, req, db, notifier }: RouteHandlerOptions,
    taskFn: (cb: Router) => Promise<any>
) {
    try {
        const json = await taskFn({
            notifier,
            db,
            user: req.user!
        });
        // We assume that if the taskFn function resolves, then we have a valid 200 response
        res.json(json);
    } catch (err) {
        handleUncaughtError(taskName, res, err);
    }
}
