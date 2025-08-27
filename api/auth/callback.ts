import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET' });
  }

  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const code = url.searchParams.get('code');
  if (!code) return res.status(400).json({ error: 'Missing ?code' });

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code })
    });
    const json = await tokenRes.json();
    if (!('access_token' in json)) return res.status(400).json(json);
    res.status(200).json({ token: json.access_token });
  } catch (e) {
    res.status(500).json({ error: 'Token exchange failed' });
  }
}
