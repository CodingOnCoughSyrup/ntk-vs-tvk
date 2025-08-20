import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import LoadingOverlay from '../components/LoadingOverlay';
import { MiniPie } from '../components/ChartsMini';
import Modal from '../components/Modal';
import Carousel from '../components/Carousel';
import { parseDMY, isWithinRange, rangeFromPreset } from '../utils/date';

export default function ConferencesPage() {
  const [raw, setRaw] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [appliedLabel, setAppliedLabel] = useState(null);
  const [asc, setAsc] = useState(false);
  const [modalA, setModalA] = useState(false);
  const [modalB, setModalB] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/conferences');
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
        // For preset/range filtering, ignore rows with invalid dates
        return d ? ((!fromD || d >= fromD) && (!toD || d <= toD)) : false;
    });

    let label = 'Showing: Life Time';
    if (fromD || toD) {
        const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        label = `Showing: ${fromD ? fmt(fromD) : '…'} → ${toD ? fmt(toD) : '…'}`;
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


  // Comparison stats (filtered)
  const stats = useMemo(() => {
    const init = { NTK: { count: 0, dur: 0 }, TVK: { count: 0, dur: 0 } };
    for (const r of rows) {
      if (r.party === 'NTK') { init.NTK.count++; init.NTK.dur += r.duration; }
      else if (r.party === 'TVK') { init.TVK.count++; init.TVK.dur += r.duration; }
    }
    return init;
  }, [rows]);

  // Carousels source
  const ntkItems = useMemo(() => rows.filter(r => r.party === 'NTK').map(r => ({
    id: r.id,
    dateDMY: r.dateDMY,
    ytUrl: r.ytUrl,
    label: r.topic || r.dateDMY,
    extra: `${r.duration} m`
  })), [rows]);

  const tvkItems = useMemo(() => rows.filter(r => r.party === 'TVK').map(r => ({
    id: r.id,
    dateDMY: r.dateDMY,
    ytUrl: r.ytUrl,
    label: r.topic || r.dateDMY,
    extra: `${r.duration} m`
  })), [rows]);

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
          <h2 className="text-3xl font-bold">Conferences</h2>
          <p className="opacity-80">Comparison → two carousels (NTK & TVK). Click a card to open the video.</p>
        </div>

        <FilterBar onApply={applyFilter} onClear={clearFilter} disabled={loading} />

        {/* Comparison Table */}
        <div className="tile mt-4 overflow-auto">
          <table className="min-w-[620px] w-full">
            <thead>
              <tr className="text-left">
                <th className="p-3">Party</th>
                <th className="p-3">No. of Conferences</th>
                <th className="p-3">Speech Duration (m)</th>
              </tr>
            </thead>
            <tbody>
              {['NTK','TVK'].map(p => (
                <tr key={p} className="border-t border-white/40 dark:border-white/5">
                  <td className="p-3 font-semibold">{p}</td>
                  <td className="p-3">{stats[p].count}</td>
                  <td className="p-3">{stats[p].dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {appliedLabel && <div className="text-sm opacity-70 mt-2">{appliedLabel}</div>}
        </div>

        {/* Charts (mini) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tile">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">NTK vs TVK (Count)</div>
              <button className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10" onClick={() => setModalA(true)}>Expand</button>
            </div>
            <MiniPie data={pieCounts} />
          </div>
          <div className="tile">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">NTK vs TVK (Speech Minutes)</div>
              <button className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10" onClick={() => setModalB(true)}>Expand</button>
            </div>
            <MiniPie data={pieDur} />
          </div>
        </div>

        {/* Sort toggle for both carousels */}
        <div className="mt-4 flex items-center justify-end">
          <button
            className="tile px-3 py-2 hover:opacity-90"
            onClick={() => setAsc(a => !a)}
            title="Toggle sorting for carousels"
          >
            Sort carousels: {asc ? 'Oldest → Newest' : 'Newest → Oldest'}
          </button>
        </div>

        {/* Carousels */}
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Carousel title="NTK — Conferences" items={ntkItems} asc={asc} />
          <Carousel title="TVK — Conferences" items={tvkItems} asc={asc} />
        </div>

        {/* Modals */}
        <Modal open={modalA} onClose={() => setModalA(false)} title="Conferences — Count">
          <MiniPie data={pieCounts} />
        </Modal>
        <Modal open={modalB} onClose={() => setModalB(false)} title="Conferences — Speech Minutes">
          <MiniPie data={pieDur} />
        </Modal>
      </main>
    </div>
  );
}
