import express from 'express';
import { json, urlencoded } from 'body-parser';

const app = express();
app.set('strict routing', true);

/**
 * Express middleware
 */
if (process.env.NODE_ENV !== 'production') {
    app.use(
        require('cors')({
            origin: process.env.APP_URL,
            credentials: true
        })
    );
}

app.use(json({}));
app.use(urlencoded({ extended: true }));

export default app;
