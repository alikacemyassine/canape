import { getTokenFromRequest, verifySessionToken } from '../_lib/auth.js';

export default function handler(req, res) {
    const token = getTokenFromRequest(req);
    return res.status(200).json({ authenticated: verifySessionToken(token) });
}
