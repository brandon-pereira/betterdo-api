process.env.DATABASE_NAME = 'betterdo-unitTests';

export default async (): Promise<void> => {
    // Ideally we can connect here but dynamic import causes massive babel issues, ignoring it for now.
    // const { connect } = await import('../src/database');
    // await connect();
};
