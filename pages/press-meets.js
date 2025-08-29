import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import FilterSection from '../components/FilterSection';
import LoadingOverlay from '../components/LoadingOverlay';
import { MiniPie } from '../components/ChartsMini';
import Carousel from '../components/Carousel';
import { parseDMY, rangeFromPreset } from '../utils/date';

export default function PressMeetsPage() {
  const [raw, setRaw] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [appliedLabel, setAppliedLabel] = useState(null);
  const [asc, setAsc] = useState(false);
  const [search, setSearch] = useState('');
  const [party, setParty] = useState('both');
  // Re-added view/table state (revert last cleanup)
  const [view, setView] = useState('carousel'); // 'carousel' | 'table'
  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/press');
        const j = await r.json();
        if (active && j.ok) {
          setRaw(j.data || []);
          setRows(j.data || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  function applyFilter({ preset, from, to }) {
    setFiltering(true);

    // If truly "Life Time", don't filter at all
    if ((!from && !to) && (!preset || preset === 'all')) {
      setRows(raw || []);
      setAppliedLabel('Showing: Life Time');
      setTimeout(() => setFiltering(false), 120);
      return;
    }

    let fromD = null, toD = null;
    if (from) { const d = new Date(from); fromD = new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    if (to)   { const d = new Date(to);   toD   = new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    if (!fromD && !toD) { const p = rangeFromPreset(preset || 'all'); fromD = p.start; toD = p.end; }

    const filtered = (raw || []).filter(r => {
      const d = parseDMY(r.dateDMY);
      return d ? ((!fromD || d >= fromD) && (!toD || d <= toD)) : false;
    });

    let label = 'Showing: Life Time';
    if (fromD || toD) {
      const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
      label = `Showing: ${fromD ? fmt(fromD) : '--'} to ${toD ? fmt(toD) : '--'}`;
    } else if (preset && preset !== 'all') {
      const map = { '1m':'Past month','3m':'Past 3 months','6m':'Past 6 months','1y':'Past year' };
      label = `Showing: ${map[preset] || 'Life Time'}`;
    }

    setAppliedLabel(label);
    setRows(filtered);
    setTimeout(() => setFiltering(false), 120);
  }

  function clearFilter() {
    setFiltering(true);
    setRows(raw || []);
    setAppliedLabel(null);
    setTimeout(() => setFiltering(false), 120);
  }

  // Search filter (affects carousels only)
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => (
      (r.dateDMY || '').toLowerCase().includes(q) ||
      (r.party || '').toLowerCase().includes(q)
    ));
  }, [rows, search]);

  // Re-added: sort for table view compatibility
  const sortedFilteredRows = useMemo(() => {
    const arr = [...filteredRows];
    arr.sort((a, b) => {
      const da = parseDMY(a?.dateDMY)?.getTime() || 0;
      const db = parseDMY(b?.dateDMY)?.getTime() || 0;
      return asc ? (da - db) : (db - da);
    });
    return arr;
  }, [filteredRows, asc]);

  // Table pagination (kept for compatibility)
  const pageSize = 10;
  const tableTotalPages = Math.max(1, Math.ceil(sortedFilteredRows.length / pageSize));
  const tableStart = (tablePage - 1) * pageSize;
  const tableItems = sortedFilteredRows.slice(tableStart, tableStart + pageSize);
  useEffect(() => { setTablePage(1); }, [search, rows?.length, asc]);

  // Comparison stats (filtered)
  const stats = useMemo(() => {
    const init = { NTK: { count: 0, dur: 0 }, TVK: { count: 0, dur: 0 } };
    for (const r of rows) {
      if (r.party === 'NTK') { init.NTK.count++; init.NTK.dur += r.duration; }
      else if (r.party === 'TVK') { init.TVK.count++; init.TVK.dur += r.duration; }
    }
    return init;
  }, [rows]);

  // Combined carousel source with party filter
  const combinedItems = useMemo(() => {
    let list = filteredRows;
    if (party === 'NTK') list = list.filter(r => r.party === 'NTK');
    else if (party === 'TVK') list = list.filter(r => r.party === 'TVK');
    return list.map(r => ({
      id: r.id,
      dateDMY: r.dateDMY,
      ytUrl: r.ytUrl,
      label: r.dateDMY,
      party: r.party,
      extra: `${r.duration} m`
    }));
  }, [filteredRows, party]);

  const pieCounts = [
    { name: 'NTK', value: stats.NTK.count },
    { name: 'TVK', value: stats.TVK.count }
  ];
  const pieDur = [
    { name: 'NTK', value: stats.NTK.dur },
    { name: 'TVK', value: stats.TVK.dur }
  ];

  return (
    <div className="min-h-screen bg-abstract">
      <LoadingOverlay show={filtering || loading} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Navbar />
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">Press Meets</h2>
          <p className="opacity-80">A list of all the press meets by a party and the total time they spoke</p>
        </div>

        <FilterSection onApply={applyFilter} onClear={clearFilter} disabled={loading} />

        {/* Search + Sort toolbar (mobile wraps) */}
        {/* Controls moved into carousel header */}

        {/* Combined Carousel */}
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Carousel
            title={party === 'both' ? 'Press Meets - NTK & TVK' : `Press Meets - ${party}`}
            items={combinedItems}
            asc={asc}
            headerExtras={(
              <>
                <input
                  className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 w-36 md:w-64"
                  placeholder="Search Press Meet..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button
                  className="px-3 py-2 rounded-lg bg-gray-200/70 dark:bg-white/10"
                  onClick={() => setAsc(a => !a)}
                  title="Toggle sorting order"
                >
                  Sort: {asc ? 'Oldest → Newest' : 'Newest → Oldest'}
                </button>
                <button
                  className="px-3 py-2 rounded-lg bg-gray-200/70 dark:bg-white/10"
                  onClick={() => setParty(p => (p === 'both' ? 'NTK' : p === 'NTK' ? 'TVK' : 'both'))}
                  title="Cycle party filter"
                >
                  Party: {party}
                </button>
              </>
            )}
          />
        </div>

        {/* Comparison Table moved to bottom */}
        <div className="tile mt-4 overflow-auto text-sm md:text-base">
          <table className="w-full md:min-w-[560px]">
            <thead>
              <tr className="text-left">
                <th className="p-2 md:p-3">Party</th>
                <th className="p-2 md:p-3">No. of Press Meets</th>
                <th className="p-2 md:p-3">Speech Duration (m)</th>
              </tr>
            </thead>
            <tbody>
              {['NTK','TVK'].map(p => (
                <tr key={p} className="border-t border-white/40 dark:border-white/5">
                  <td className="p-2 md:p-3 font-semibold">{p}</td>
                  <td className="p-2 md:p-3">{stats[p].count}</td>
                  <td className="p-2 md:p-3">{stats[p].dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {appliedLabel && <div className="text-sm opacity-70 mt-2">{appliedLabel}</div>}
        </div>

        {/* Charts moved to bottom */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tile">
            <MiniPie title="NTK vs TVK (Count)" data={pieCounts} compact />
          </div>
          <div className="tile">
            <MiniPie title="NTK vs TVK (Speech Minutes)" data={pieDur} compact />
          </div>
        </div>
      </main>
    </div>
  );
}
