import { InternalRouter } from '../helpers/routeHandler';

const serverUrl = process.env.SERVER_URL || '/';

export default ({ app }: InternalRouter): void => {
    app.get('/auth/logout', (req, res) => {
        req.logout();
        const referrer = req.header('referrer');
        if (referrer) {
            res.redirect(referrer);
        } else {
            res.redirect(serverUrl);
        }
    });
    app.post('/auth/logout', (req, res) => {
        req.logout();
        res.json({ success: true });
    });
};
