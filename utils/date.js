export function parseDMY(input) {
  if (!input) return null;
  const s = String(input).trim();
  // dd/mm/yyyy or dd-mm-yyyy
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (m) {
    let dd = Number(m[1]);
    let mm = Number(m[2]);
    let yyyy = Number(m[3]);
    if (String(yyyy).length === 2) yyyy = yyyy < 50 ? 2000 + yyyy : 1900 + yyyy;
    const d = new Date(yyyy, mm - 1, dd);
    return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  // Fallback to Date()
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isWithinRange(date, from, to) {
  if (!(date instanceof Date)) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function rangeFromPreset(preset) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let start = null;
  switch (preset) {
    case '1m': start = new Date(end); start.setMonth(end.getMonth() - 1); break;
    case '3m': start = new Date(end); start.setMonth(end.getMonth() - 3); break;
    case '6m': start = new Date(end); start.setMonth(end.getMonth() - 6); break;
    case '1y': start = new Date(end); start.setFullYear(end.getFullYear() - 1); break;
    case 'all':
    default:   start = null;
  }
  return { start, end };
}

export default { parseDMY, isWithinRange, rangeFromPreset };
