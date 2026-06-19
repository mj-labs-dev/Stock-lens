export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug, type } = req.body;
    if (!slug || (type !== 'like' && type !== 'dislike')) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const upstream = await fetch('https://www.mj-labs.dev/api/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, type }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    console.error('[api/react]', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
