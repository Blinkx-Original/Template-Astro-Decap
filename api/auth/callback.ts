export default async function handler(req: any, res: any) {
  // Allow CORS preflight if the browser sends OPTIONS
  if (req.method === 'OPTIONS') return res.status(204).end();

  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing GitHub OAuth env vars');
    return res.status(500).json({ error: 'Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET' });
    }

  // Extract ?code from the callback URL
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const code = url.searchParams.get('code');
  if (!code) return res.status(400).json({ error: 'Missing ?code' });

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      })
    });

    const json: any = await tokenRes.json();
    if (!json || !json.access_token) {
      console.error('Token exchange failed:', json);
      return res.status(400).json(json);
    }

    // Return token to Decap
    return res.status(200).json({ token: json.access_token });
  } catch (err) {
    console.error('OAuth callback error:', err);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
}
