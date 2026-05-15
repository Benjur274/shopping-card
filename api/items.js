const { put, list, del } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'shopping-list' });
      if (blobs.length === 0) {
        return res.status(200).json([]);
      }
      // Najnovší blob (unikátna URL = žiadna CDN cache)
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      )[0];
      const response = await fetch(latest.url);
      const items = await response.json();
      return res.status(200).json(items);
    } catch {
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const items = req.body;

      // Vytvor nový blob s unikátnou URL (addRandomSuffix: true = default)
      const newBlob = await put('shopping-list.json', JSON.stringify(items), {
        access: 'public',
        contentType: 'application/json',
      });

      // Zmaž všetky staré bloby (okrem práve vytvoreného)
      const { blobs } = await list({ prefix: 'shopping-list' });
      const old = blobs.filter((b) => b.url !== newBlob.url);
      if (old.length > 0) {
        await del(old.map((b) => b.url));
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Save error:', e);
      return res.status(500).json({ error: 'Failed to save' });
    }
  }

  return res.status(405).end();
};
