import { disconnect } from '../src/database';

export default async (): Promise<void> => {
    await disconnect();
};
