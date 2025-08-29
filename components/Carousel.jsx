// components/Carousel.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { parseDMY } from '../utils/date';
import { getThumbUrl } from '../utils/youtube';

export default function Carousel({ title, items = [], asc = false, pageSize = 10, headerExtras = null, emptyMessage = 'Nothing is found in the specified range.' }) {
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const MOBILE_CHUNK = 12;
  const [mobileCount, setMobileCount] = useState(MOBILE_CHUNK);
  const mobileRef = useRef(null);

  const sorted = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];
    arr.sort((a, b) => {
      const da = parseDMY(a?.dateDMY)?.getTime() || 0;
      const db = parseDMY(b?.dateDMY)?.getTime() || 0;
      return asc ? (da - db) : (db - da);
    });
    return arr;
  }, [items, asc]);

  useEffect(() => { setPage(1); }, [items?.length, asc]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);

  // Mobile detection + reset chunk size when data changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(!!mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener('change', update); else mq.addListener(update);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', update); else mq.removeListener(update); };
  }, []);
  useEffect(() => { setMobileCount(MOBILE_CHUNK); }, [items?.length, asc]);

  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);
  const mobileItems = sorted.slice(0, mobileCount);

  function openVideo(url) {
    if (!url) return alert('No video for this item.');
    if (confirm('Open external website?')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="tile" key={`${title}-${items?.length}-${asc}-${pageSize}`}>
      <div className="mb-2">
        <div className="font-semibold mb-2">{title}</div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {headerExtras}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10">Previous</button>
            <span className="text-sm">Page {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10">Next</button>
          </div>
        </div>
      </div>

      {/* Mobile: horizontal scroll with incremental loading */}
      <div
        className="md:hidden overflow-x-auto -mx-2 px-2"
        ref={mobileRef}
        onScroll={() => {
          const el = mobileRef.current; if (!el) return;
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 32) {
            setMobileCount(c => (c < sorted.length ? Math.min(sorted.length, c + MOBILE_CHUNK) : c));
          }
        }}
      >
        {mobileItems.length === 0 ? (
          <div className="p-3 text-sm opacity-70">{emptyMessage}</div>
        ) : (
          <div className="flex gap-3 snap-x snap-mandatory">
            {mobileItems.map((it) => {
              const thumb = getThumbUrl(it?.ytUrl);
              const src = (thumb?.hq && isMobile) ? thumb.hq : (thumb?.max || '');
              const fallback = thumb?.hq || '';
              const partyTagBg = it?.party === 'NTK' ? 'bg-sky-500' : (it?.party === 'TVK' ? 'bg-emerald-500' : 'bg-gray-500');
              return (
                <button key={it.id} onClick={() => openVideo(it?.ytUrl)}
                  className="tile p-0 overflow-hidden hover:opacity-95 text-left min-w-[11rem] snap-start" title="Open YouTube">
                  {src ? (
                    <img src={src} alt={it?.label || it?.dateDMY || 'Press/Conference'}
                      className="w-full h-24 object-cover"
                      onError={(e) => { if (fallback) e.currentTarget.src = fallback; }} loading="lazy" decoding="async" fetchpriority="low" />
                  ) : (
                    <div className="h-24 flex items-center justify-center text-4xl">📺</div>
                  )}
                  <div className="p-2">
                    <div className="font-medium truncate">{it?.label || it?.dateDMY || '--'}</div>
                    {(it?.extra != null || it?.party) && (
                      <div className="text-xs opacity-70 mt-1 flex items-center justify-between gap-2">
                        <span>{it?.extra}</span>
                        {it?.party && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${partyTagBg}`}>
                            {it.party}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid on all screens (no horizontal scroll) */}
      {pageItems.length === 0 ? (
        <div className="p-3 text-sm opacity-70">{emptyMessage}</div>
      ) : (
        <div className="hidden md:grid md:grid-cols-5 gap-2 md:gap-3">
          {pageItems.map((it) => {
            const thumb = getThumbUrl(it?.ytUrl);
            const src = thumb?.max || '';
            const fallback = thumb?.hq || '';
            const partyTagBg = it?.party === 'NTK' ? 'bg-sky-500' : (it?.party === 'TVK' ? 'bg-emerald-500' : 'bg-gray-500');
            return (
              <button key={it.id} onClick={() => openVideo(it?.ytUrl)}
                className="tile p-0 overflow-hidden hover:opacity-95 text-left" title="Open YouTube">
              {src ? (
                <img src={src} alt={it?.label || it?.dateDMY || 'Press/Conference'}
                  className="w-full h-24 md:h-28 object-cover"
                  onError={(e) => { if (fallback) e.currentTarget.src = fallback; }} loading="lazy" />
              ) : (
                <div className="h-24 md:h-28 flex items-center justify-center text-4xl">📺</div>
              )}
              <div className="p-2">
                <div className="font-medium truncate">{it?.label || it?.dateDMY || '--'}</div>
                {(it?.extra != null || it?.party) && (
                  <div className="text-xs opacity-70 mt-1 flex items-center justify-between gap-2">
                    <span>{it?.extra}</span>
                    {it?.party && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${partyTagBg}`}>
                        {it.party}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}
