// pages/api/aggregate.js
const {
  readSheetByGid,
  normalizeIssues,
  normalizeProtestsLike,
  normalizePress,
  normalizeConference,
  GID_ISSUES,
  GID_PROTEST,
  GID_PRESS,
  GID_CONFERENCE
} = require('../../lib/sheets.cjs');

export default async function handler(req, res) {
  try {
    const [issuesRaw, protestRaw, pressRaw, confRaw] = await Promise.all([
      readSheetByGid(GID_ISSUES),
      readSheetByGid(GID_PROTEST),
      GID_PRESS ? readSheetByGid(GID_PRESS) : Promise.resolve({ rows: [] }),
      GID_CONFERENCE ? readSheetByGid(GID_CONFERENCE) : Promise.resolve({ rows: [] })
    ]);

    const issues = normalizeIssues(issuesRaw.rows || []);
    const protests = normalizeProtestsLike(protestRaw.rows || []);
    const press = normalizePress(pressRaw.rows || []);
    const conference = normalizeConference(confRaw.rows || []);

    const totals = {
      issues: {
        total: issues.length,
        ntk: issues.filter(r => !!r.ntkUrl).length,
        tvk: issues.filter(r => !!r.tvkUrl).length,
      },
      protests: {
        total: protests.length,
        ntk: protests.filter(r => !!r.ntkUrl).length,
        tvk: protests.filter(r => !!r.tvkUrl).length,
      },
      press: {
        total: press.length,
        ntk: press.filter(r => r.party === 'NTK').length,
        tvk: press.filter(r => r.party === 'TVK').length,
      },
      conference: {
        total: conference.length,
        ntk: conference.filter(r => r.party === 'NTK').length,
        tvk: conference.filter(r => r.party === 'TVK').length,
      },
      speechMinutes: {
        ntk:
          protests.reduce((a, r) => a + (r.ntkSpeech || 0), 0) +
          press.filter(r => r.party === 'NTK').reduce((a, r) => a + (r.duration || 0), 0) +
          conference.filter(r => r.party === 'NTK').reduce((a, r) => a + (r.duration || 0), 0),
        tvk:
          protests.reduce((a, r) => a + (r.tvkSpeech || 0), 0) +
          press.filter(r => r.party === 'TVK').reduce((a, r) => a + (r.duration || 0), 0) +
          conference.filter(r => r.party === 'TVK').reduce((a, r) => a + (r.duration || 0), 0),
      }
    };

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(200).json({ ok: true, totals });
  } catch (e) {
    console.error('AGGREGATE_API_ERROR', e);
    res.status(500).json({ ok: false, error: 'Failed to aggregate' });
  }
}
