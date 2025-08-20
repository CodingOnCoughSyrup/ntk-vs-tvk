// components/Carousel.jsx
import { useEffect, useMemo, useState } from 'react';
import { parseDMY } from '../utils/date';
import { getThumbUrl } from '../utils/youtube';

export default function Carousel({ title, items = [], asc = false, pageSize = 10 }) {
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];
    arr.sort((a, b) => {
      const da = parseDMY(a?.dateDMY)?.getTime() || 0;
      const db = parseDMY(b?.dateDMY)?.getTime() || 0;
      return asc ? (da - db) : (db - da);
    });
    return arr;
  }, [items, asc]);

  // Reset when the dataset length or sort order changes
  useEffect(() => { setPage(1); }, [items?.length, asc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  // Clamp if out-of-range after filtering
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  function openVideo(url) {
    if (!url) return alert('No video for this item.');
    if (confirm('Open external website?')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="tile" key={`${title}-${items?.length}-${asc}-${pageSize}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10"
          >
            Previous
          </button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
        {pageItems.map((it) => {
          const thumb = getThumbUrl(it?.ytUrl);
          const src = thumb?.max || '';
          const fallback = thumb?.hq || '';
          return (
            <button
              key={it.id}
              onClick={() => openVideo(it?.ytUrl)}
              className="tile p-0 overflow-hidden hover:opacity-95 text-left"
              title="Open YouTube"
            >
              {src ? (
                <img
                  src={src}
                  alt={it?.label || it?.dateDMY || 'Press/Conference'}
                  className="w-full h-28 object-cover"
                  onError={(e) => { if (fallback) e.currentTarget.src = fallback; }}
                  loading="lazy"
                />
              ) : (
                <div className="h-28 flex items-center justify-center text-4xl">🎬</div>
              )}
              <div className="p-2">
                <div className="font-medium">{it?.label || it?.dateDMY || '—'}</div>
                {it?.extra != null && <div className="text-xs opacity-70 mt-1">{it.extra}</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
