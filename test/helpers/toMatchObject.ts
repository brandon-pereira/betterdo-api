/* eslint-disable @typescript-eslint/no-namespace */
// https://stackoverflow.com/a/43674912/7033335
import { ObjectId } from 'mongoose';

export {};

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchId(expected: ObjectId): R;
        }
    }
}

expect.extend({
    toMatchId(received, id) {
        const pass = received.toString() === id.toString();
        return {
            message: () => `expected "${received}" to match "${id}"`,
            pass
        };
    }
});
