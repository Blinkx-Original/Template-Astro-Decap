export default async function handler(req: any, res: any) {
  // Allow CORS preflight if the browser sends OPTIONS
  if (req.method === 'OPTIONS') return res.status(204).end();

  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  if (!CLIENT_ID) {
    console.error('Missing GITHUB_CLIENT_ID');
    return res.status(500).json({ error: 'Missing GITHUB_CLIENT_ID' });
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  const callbackUrl = `${proto}://${host}/api/auth/callback`;

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', CLIENT_ID);
  authorize.searchParams.set('scope', 'repo,user');
  authorize.searchParams.set('redirect_uri', callbackUrl);

  res.statusCode = 302;
  res.setHeader('Location', authorize.toString());
  res.end();
}
