import { UserDocument } from '../../src/schemas/users';

declare global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface User extends UserDocument {}
    }
}
