// CJS module to avoid ESM import wrinkles in API routes
const { google } = require('googleapis');

const spreadsheetId = process.env.GSHEET_ID;
const GID_ISSUES = process.env.GID_ISSUES;
const GID_PROTEST = process.env.GID_PROTEST;
const GID_PRESS = process.env.GID_PRESS;
const GID_CONFERENCE = process.env.GID_CONFERENCE;

// Simple in-memory cache per lambda container (short-lived on Vercel)
const cache = new Map();
const TTL_MS = 60 * 1000; // 60s short cache

function getKey(...parts) { return parts.join('::'); }

function setCache(key, value) {
  cache.set(key, { value, expiry: Date.now() + TTL_MS });
}
function getCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiry) { cache.delete(key); return null; }
  return hit.value;
}

/** Build an authenticated Sheets client (server-side only). */
function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || "";
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey || !spreadsheetId) {
    const missing = [];
    if (!clientEmail) missing.push('GOOGLE_SHEETS_CLIENT_EMAIL');
    if (!privateKey) missing.push('GOOGLE_SHEETS_PRIVATE_KEY');
    if (!spreadsheetId) missing.push('GSHEET_ID');
    throw new Error(`Missing Google Sheets env: ${missing.join(', ')}`);
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  return google.sheets({ version: 'v4', auth });
}

/** Resolve a sheet title from its GID (sheetId). Cached. */
async function getTitleByGid(sheets, gid) {
  const cacheKey = getKey('titleByGid', gid);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: false
  });
  const found = (meta.data.sheets || []).find(s => String(s.properties.sheetId) === String(gid));
  if (!found) throw new Error(`No sheet with gid ${gid}`);
  const title = found.properties.title;
  setCache(cacheKey, title);
  return title;
}

/** Read all rows A:Z from a sheet given its GID; returns { headers, rows } */
async function readSheetByGid(gid) {
  const cacheKey = getKey('values', gid);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const client = getSheetsClient();
  const title = await getTitleByGid(client, gid);

  const resp = await client.spreadsheets.values.get({
    spreadsheetId,
    range: `${title}!A:Z`
  });

  const values = resp.data.values || [];
  const headers = (values[0] || []).map(h => (h || '').trim());
  const rows = values.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (r[i] ?? '').toString().trim(); });
    return obj;
  });

  const result = { title, headers, rows };
  setCache(cacheKey, result);
  return result;
}

/** Helpers to normalize domain-specific sheets */
function normalizeIssues(rows) {
  // Incident/Problem, NTK, TVK, Date (DD/MM/YYYY)
  return rows.map((r, i) => ({
    id: `issue_${i + 1}`,
    issue: r['Incident/Problem'] || r['Incident'] || r['Problem'] || '',
    issue_ta: r['Incident (Tamil)'] || '',
    ntkUrl: r['NTK'] || '',
    tvkUrl: r['TVK'] || '',
    dateDMY: r['Date'] || r['DATE'] || r['date'] || ''
  }));
}

function normalizeProtestsLike(rows) {
  // Date, Issue, Protest/People Meet, NTK, NTK Speech, TVK, TVK Speech
  return rows.map((r, i) => ({
    id: `row_${i + 1}`,
    issue: r['Issue'] || r['Title'] || '',
    issue_ta: r['Issue (Tamil)'] || '',
    type: r['Protest/People Meet'] || r['Type'] || '',
    ntkUrl: r['NTK'] || '',
    tvkUrl: r['TVK'] || '',
    ntkSpeech: Number(r['NTK Speech'] || r['NTK speech'] || 0) || 0,
    tvkSpeech: Number(r['TVK Speech'] || r['TVK speech'] || 0) || 0,
    dateDMY: r['Date'] || r['DATE'] || r['date'] || ''
  }));
}

/** Parse minutes from free text like "12", "12 m", "10min" etc. */
function parseMinutes(v) {
  if (v == null) return 0;
  const s = String(v).trim();
  const m = s.match(/([0-9]*\.?[0-9]+)/);
  return m ? Math.round(parseFloat(m[1])) : 0;
}

/** Press Meets: Date, Party (NTK/TVK), Duration (m), YouTube */
function normalizePress(rows) {
  return rows.map((r, i) => {
    const rawParty = (r['Party'] || r['party'] || '').trim().toUpperCase();
    if (rawParty !== 'NTK' && rawParty !== 'TVK') return null; // ignore blanks/others
    return {
      id: `press_${i + 1}`,
      party: rawParty,
      duration: parseMinutes(r['Duration']),
      ytUrl: String(r['YouTube'] || r['YT'] || '').trim(),
      dateDMY: String(r['Date'] || r['DATE'] || r['date'] || '').trim()
    };
  }).filter(Boolean);
}

/** Conferences: Date, Topic, Party (NTK/TVK), Duration (m), YouTube */
function normalizeConference(rows) {
  return rows.map((r, i) => {
    const rawParty = (r['Party'] || r['party'] || '').trim().toUpperCase();
    if (rawParty !== 'NTK' && rawParty !== 'TVK') return null;
    return {
      id: `conf_${i + 1}`,
      topic: String(r['Topic'] || r['Conference'] || '').trim(),
      topic_ta: String(r['Topic (Tamil)'] || '').trim(),
      party: rawParty,
      duration: parseMinutes(r['Duration']),
      ytUrl: String(r['YouTube'] || r['YT'] || '').trim(),
      dateDMY: String(r['Date'] || r['DATE'] || r['date'] || '').trim()
    };
  }).filter(Boolean);
}

module.exports = {
  readSheetByGid,
  normalizeIssues,
  normalizeProtestsLike,
  normalizePress,
  normalizeConference,
  GID_ISSUES,
  GID_PROTEST,
  GID_PRESS,
  GID_CONFERENCE
};
