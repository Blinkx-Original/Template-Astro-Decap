import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (!CLIENT_ID) {
    res.status(500).json({ error: 'Missing GITHUB_CLIENT_ID' });
    return;
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  const callbackUrl = `${proto}://${host}/api/auth/callback`;

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', CLIENT_ID);
  authorize.searchParams.set('scope', 'repo,user');
  authorize.searchParams.set('redirect_uri', callbackUrl);

  res.status(302).setHeader('Location', authorize.toString());
  res.end();
}
