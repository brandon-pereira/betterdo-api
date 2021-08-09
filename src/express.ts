import express from 'express';

const app = express();
app.set('strict routing', true);

// /**
//  * Express middleware
//  */
// if (process.env.NODE_ENV !== 'production') {
//     app.use(
//         require('cors')({
//             origin: process.env.APP_URL,
//             credentials: true
//         })
//     );
// }

// app.use(require('body-parser').json({}));
// app.use(require('body-parser').urlencoded({ extended: true }));

export default app;
