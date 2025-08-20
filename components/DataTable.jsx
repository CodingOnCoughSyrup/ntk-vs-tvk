// components/DataTable.jsx
import { useMemo, useState } from 'react';
import { parseDMY } from '../utils/date';

const PAGE_SIZE = 20;

export default function DataTable({
  kind,             // 'issues' | 'protests'
  rows,             // <-- already filtered by the page
  searchableKey,    // 'issue'
  dateKey,          // 'dateDMY' (only used for sorting)
  onNoteText,
  showTypeTag = false,
  appliedLabel      // <-- text like "Showing: Past 3 months" or date range
}) {
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const searched = useMemo(() => {
    let data = [...(rows || [])];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => (r[searchableKey] || '').toLowerCase().includes(q));
    }

    // Sort by date
    data.sort((a, b) => {
      const da = parseDMY(a[dateKey])?.getTime() || 0;
      const db = parseDMY(b[dateKey])?.getTime() || 0;
      return sortDesc ? (db - da) : (da - db);
    });

    return data;
  }, [rows, search, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const paged = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openMaybe(url, hasItem) {
    if (!hasItem || !url) return alert('No posts regarding this.');
    const ok = confirm('Open external website?');
    if (ok) window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="tile flex items-center gap-3">
          <input
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10"
            placeholder={`Search ${kind === 'issues' ? 'Issue' : 'Protest'}...`}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="px-3 py-2 rounded-lg bg-gray-200/70 dark:bg-white/10"
                  onClick={() => setSortDesc(s => !s)}>
            Sort: {sortDesc ? 'Newest → Oldest' : 'Oldest → Newest'}
          </button>
        </div>

        {appliedLabel && (
          <div className="tile">
            <div className="text-sm tracking-wide">{appliedLabel}</div>
          </div>
        )}
      </div>

      <div className="overflow-auto tile mt-3">
        <table className="min-w-[720px] w-full">
          <thead>
            <tr className="text-left">
              {kind === 'issues' ? (
                <>
                  <th className="p-3">Issue Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">NTK</th>
                  <th className="p-3">TVK</th>
                </>
              ) : (
                <>
                  <th className="p-3">Date</th>
                  <th className="p-3">Issue Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">NTK</th>
                  <th className="p-3">TVK</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.map(r => {
              const hasNtk = !!r.ntkUrl;
              const hasTvk = !!r.tvkUrl;
              const ntkEmoji = hasNtk ? '✅' : '❌';
              const tvkEmoji = hasTvk ? '✅' : '❌';

              return (
                <tr key={r.id} className="border-t border-white/40 dark:border-white/5">
                  {kind === 'issues' ? (
                    <>
                      <td className="p-3 text-lg">{r.issue}</td>
                      <td className="p-3">{r.dateDMY}</td>
                      <td className="p-3">
                        <a className="emoji-link no-underline text-2xl"
                           onClick={() => openMaybe(r.ntkUrl, hasNtk)} role="button"> {ntkEmoji} </a>
                      </td>
                      <td className="p-3">
                        <a className="emoji-link no-underline text-2xl"
                           onClick={() => openMaybe(r.tvkUrl, hasTvk)} role="button"> {tvkEmoji} </a>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3">{r.dateDMY}</td>
                      <td className="p-3 text-lg">{r.issue}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/40">
                          {r.type || '—'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <a className="emoji-link no-underline text-2xl"
                             onClick={() => openMaybe(r.ntkUrl, hasNtk)} role="button"> {ntkEmoji} </a>
                          <span className="opacity-70 text-sm">({r.ntkSpeech || 0} min)</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <a className="emoji-link no-underline text-2xl"
                             onClick={() => openMaybe(r.tvkUrl, hasTvk)} role="button"> {tvkEmoji} </a>
                          <span className="opacity-70 text-sm">({r.tvkSpeech || 0} min)</span>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {searched.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm opacity-70">{onNoteText}</div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10">Previous</button>
            <span className="text-sm">Page {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10">Next</button>
          </div>
        </div>
      )}
    </>
  );
}
