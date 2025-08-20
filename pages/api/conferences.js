const {
  readSheetByGid,
  normalizeConference,
  GID_CONFERENCE
} = require('../../lib/sheets.cjs');

export default async function handler(req, res) {
  try {
    const { rows } = await readSheetByGid(GID_CONFERENCE);
    const data = normalizeConference(rows || []);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error('CONF_API_ERROR', e);
    res.status(500).json({ ok: false, error: 'Failed to read Conferences sheet' });
  }
}
