const { put, list, del } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'shopping-list' });
      if (blobs.length === 0) {
        return res.status(200).json([]);
      }
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      )[0];
      const response = await fetch(latest.url);
      const items = await response.json();
      return res.status(200).json(items);
    } catch (e) {
      console.error('GET error:', e);
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const items = req.body;
      console.log('Saving items:', JSON.stringify(items));

      // 1. Zachyť staré bloby PRED vytvorením nového
      const { blobs: oldBlobs } = await list({ prefix: 'shopping-list' });

      // 2. Vytvor nový blob (unikátna URL, žiadna CDN cache)
      await put('shopping-list.json', JSON.stringify(items), {
        access: 'public',
        contentType: 'application/json',
      });

      // 3. Zmaž len staré bloby (podľa URL zachytených pred putom)
      if (oldBlobs.length > 0) {
        await del(oldBlobs.map((b) => b.url));
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Save error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
};
