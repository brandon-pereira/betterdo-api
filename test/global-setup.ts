// @ts-expect-error: not bothering adding typing for setup file for this package
import jestMongoSetup from '@shelf/jest-mongodb/setup';

export default async (): Promise<void> => {
    process.env.TZ = 'America/Edmonton';
    await jestMongoSetup();
};
