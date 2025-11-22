// components/DataTable.jsx
import { useEffect, useMemo, useState } from 'react';
import { parseDMY } from '../utils/date';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_PAGE_SIZE = 20;

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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  // Party filter for issues/protests: 'both' | 'ntk-only' | 'tvk-only'
  const [party, setParty] = useState('both');
  const { t } = useLanguage();

  // Responsive page size: smaller on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(max-width: 767px)');
      const update = () => setPageSize(mq.matches ? 10 : DEFAULT_PAGE_SIZE);
      update();
      if (mq.addEventListener) mq.addEventListener('change', update);
      else mq.addListener(update);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', update);
        else mq.removeListener(update);
      };
    }
  }, []);

  const searched = useMemo(() => {
    let data = [...(rows || [])];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => (r[searchableKey] || '').toLowerCase().includes(q));
    }

    // Party filter (issues & protests)
    if (kind === 'issues' || kind === 'protests') {
      if (party === 'ntk-only') {
        data = data.filter(r => !!r.ntkUrl && !r.tvkUrl);
      } else if (party === 'tvk-only') {
        data = data.filter(r => !!r.tvkUrl && !r.ntkUrl);
      }
      // 'both' shows all
    }

    // Sort by date
    data.sort((a, b) => {
      const da = parseDMY(a[dateKey])?.getTime() || 0;
      const db = parseDMY(b[dateKey])?.getTime() || 0;
      return sortDesc ? (db - da) : (da - db);
    });

    return data;
  }, [rows, search, sortDesc, kind, party]);

  const totalPages = Math.max(1, Math.ceil(searched.length / pageSize));
  const paged = searched.slice((page - 1) * pageSize, page * pageSize);

  // Reset when size/dataset changes
  useEffect(() => { setPage(1); }, [pageSize, rows?.length, sortDesc]);

  function openMaybe(url, hasItem) {
    if (!hasItem || !url) return alert(t.table.noPosts);
    const ok = confirm(t.table.openExternal);
    if (ok) window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="tile">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <input
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 w-36 md:w-64"
            placeholder={`${t.table.search}...`}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="px-3 py-2 rounded-lg bg-gray-200/70 dark:bg-white/10"
            onClick={() => setSortDesc(s => !s)}>
            {t.table.sort}: {sortDesc ? t.table.newestOldest : t.table.oldestNewest}
          </button>
          {(kind === 'issues' || kind === 'protests') && (
            <button
              className="px-3 py-2 rounded-lg bg-gray-200/70 dark:bg-white/10"
              onClick={() => setParty(p => (p === 'both' ? 'ntk-only' : p === 'ntk-only' ? 'tvk-only' : 'both'))}
              title="Toggle party filter"
            >
              {t.table.party}: {party === 'both' ? t.table.both : party === 'ntk-only' ? t.table.ntkOnly : t.table.tvkOnly}
            </button>
          )}
        </div>

        {appliedLabel && (
          <div className="text-sm tracking-wide">{appliedLabel}</div>
        )}
      </div>

      {/* Note moved to top, below controls */}
      {onNoteText && (
        <div className="mt-2 text-sm opacity-70">{t.table.note}</div>
      )}

      {searched.length === 0 && (
        <div className="tile mt-3 text-sm">{t.table.nothingFound}</div>
      )}

      <div className="overflow-auto mt-3">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              {kind === 'issues' ? (
                <>
                  <th className="p-2 md:p-3">{t.table.date}</th>
                  <th className="p-2 md:p-3">{t.table.issueName}</th>
                  <th className="p-2 md:p-3">{t.charts.ntk}</th>
                  <th className="p-2 md:p-3">{t.charts.tvk}</th>
                </>
              ) : (
                <>
                  <th className="p-2 md:p-3">{t.table.date}</th>
                  <th className="p-2 md:p-3">{t.table.issueName}</th>
                  <th className="p-2 md:p-3 text-center">{t.charts.ntk}</th>
                  <th className="p-2 md:p-3 text-center">{t.charts.tvk}</th>
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
                      <td className="p-2 md:p-3 text-center md:text-left">{r.dateDMY}</td>
                      <td className="p-2 md:p-3"><div className="text-base md:text-lg whitespace-normal break-words flex flex-wrap items-center gap-2"><span className="inline-block">{r.issue}</span>{r.type && (<span className="px-2 py-0.5 rounded-full text-[11px] md:text-xs bg-indigo-100 dark:bg-indigo-900/40">{r.type}</span>)}</div></td>
                      <td className="p-2 md:p-3">
                        <a className="emoji-link no-underline text-xl md:text-2xl"
                          onClick={() => openMaybe(r.ntkUrl, hasNtk)} role="button"> {ntkEmoji} </a>
                      </td>
                      <td className="p-2 md:p-3">
                        <a className="emoji-link no-underline text-xl md:text-2xl"
                          onClick={() => openMaybe(r.tvkUrl, hasTvk)} role="button"> {tvkEmoji} </a>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 md:p-3 text-center md:text-left">{r.dateDMY}</td>
                      <td className="p-2 md:p-3">
                        <div className="text-base md:text-lg whitespace-normal break-words flex flex-wrap items-center gap-2">
                          <span className="inline-block">{r.issue}</span>
                          {r.type && (<span className="px-2 py-0.5 rounded-full text-[11px] md:text-xs bg-indigo-100 dark:bg-indigo-900/40">{r.type}</span>)}
                        </div>
                      </td>
                      <td className="p-2 md:p-3">
                        <div className="flex flex-col items-center md:flex-row md:items-center gap-1 md:gap-2">
                          <a className="emoji-link no-underline text-xl md:text-2xl"
                            onClick={() => openMaybe(r.ntkUrl, hasNtk)} role="button"> {ntkEmoji} </a>
                          <span className="opacity-70 text-xs md:text-sm">({r.ntkSpeech || 0} min)</span>
                        </div>
                      </td>
                      <td className="p-2 md:p-3">
                        <div className="flex flex-col items-center md:flex-row md:items-center gap-1 md:gap-2">
                          <a className="emoji-link no-underline text-xl md:text-2xl"
                            onClick={() => openMaybe(r.tvkUrl, hasTvk)} role="button"> {tvkEmoji} </a>
                          <span className="opacity-70 text-xs md:text-sm">({r.tvkSpeech || 0} min)</span>
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
        <div className="mt-3 flex items-center justify-end gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10">{t.table.previous}</button>
          <span className="text-sm">{t.table.page} {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10">{t.table.next}</button>
        </div>
      )}
    </div>
  );
}
