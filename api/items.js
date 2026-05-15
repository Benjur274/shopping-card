const { put, list } = require('@vercel/blob');

const BLOB_KEY = 'shopping-list.json';

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: 'shopping-list' });
      if (blobs.length === 0) {
        return res.status(200).json([]);
      }
      const response = await fetch(blobs[0].url, { cache: 'no-store' });
      const items = await response.json();
      return res.status(200).json(items);
    } catch {
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const items = req.body;

      await put(BLOB_KEY, JSON.stringify(items), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Save error:', e);
      return res.status(500).json({ error: 'Failed to save' });
    }
  }

  return res.status(405).end();
};
