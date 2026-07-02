export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `sb-access-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`);
    return res.status(200).json({ ok: true });
}
