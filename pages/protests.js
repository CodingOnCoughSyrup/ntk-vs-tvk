// pages/protests.js
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import FilterSection from '../components/FilterSection';
import Modal from '../components/Modal';
import { MiniPie } from '../components/ChartsMini';
import LoadingOverlay from '../components/LoadingOverlay';
import { parseDMY, isWithinRange, rangeFromPreset } from '../utils/date';

export default function ProtestsPage() {
  const [raw, setRaw] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [appliedLabel, setAppliedLabel] = useState(null);
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/protests');
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

    let fromD = null, toD = null;
    if (from) { const d = new Date(from); fromD = new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    if (to)   { const d = new Date(to);   toD   = new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

    if (!fromD && !toD) {
      const p = rangeFromPreset(preset || 'all');
      fromD = p.start; toD = p.end;
    }

    const filtered = (raw || []).filter(r => {
      const d = parseDMY(r.dateDMY);
      return isWithinRange(d, fromD, toD);
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
    setTimeout(() => setFiltering(false), 200);
  }

  function clearFilter() {
    setFiltering(true);
    setRows(raw || []);
    setAppliedLabel(null);
    setTimeout(() => setFiltering(false), 200);
  }

  const counts = useMemo(() => ({
    ntk: rows.filter(r => !!r.ntkUrl).length,
    tvk: rows.filter(r => !!r.tvkUrl).length,
    ntkSpeech: rows.reduce((a, r) => a + (r.ntkSpeech || 0), 0),
    tvkSpeech: rows.reduce((a, r) => a + (r.tvkSpeech || 0), 0)
  }), [rows]);

  const pieTicks = [
    { name: 'NTK', value: counts.ntk },
    { name: 'TVK', value: counts.tvk }
  ];
  const pieSpeech = [
    { name: 'NTK', value: counts.ntkSpeech },
    { name: 'TVK', value: counts.tvkSpeech }
  ];

  return (
    <div className="min-h-screen bg-abstract">
      <LoadingOverlay show={filtering || loading} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Navbar />
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">Protest & People Meet</h2>
          <p className="opacity-80">YouTube-confirmed events. ✅ opens video, ❌ means none.</p>
        </div>

        <FilterSection onApply={applyFilter} onClear={clearFilter} disabled={loading} />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tile">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">NTK vs TVK (Events)</div>
              <button className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10"
                onClick={() => setOpenA(true)}>Expand</button>
            </div>
            <MiniPie data={pieTicks} />
          </div>

          <div className="tile">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">NTK vs TVK (Speech Minutes)</div>
              <button className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10"
                onClick={() => setOpenB(true)}>Expand</button>
            </div>
            <MiniPie data={pieSpeech} />
          </div>
        </div>

        <div className="mt-4">
          <DataTable
            kind="protests"
            rows={rows}
            searchableKey="issue"
            dateKey="dateDMY"
            onNoteText="Note: ✅ emoji is clickable. Confirmation will appear before opening the video."
            appliedLabel={appliedLabel}
          />
        </div>

        <Modal open={openA} onClose={() => setOpenA(false)} title="Events — Full Size Chart">
          <MiniPie data={pieTicks} />
        </Modal>
        <Modal open={openB} onClose={() => setOpenB(false)} title="Speech Minutes — Full Size Chart">
          <MiniPie data={pieSpeech} />
        </Modal>
      </main>
    </div>
  );
}
