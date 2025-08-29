// pages/protests.js
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import FilterSection from '../components/FilterSection';
import { MiniPie } from '../components/ChartsMini';
import LoadingOverlay from '../components/LoadingOverlay';
import { parseDMY, isWithinRange, rangeFromPreset } from '../utils/date';

export default function ProtestsPage() {
  const [raw, setRaw] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [appliedLabel, setAppliedLabel] = useState(null);

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
      label = `Showing: ${fromD ? fmt(fromD) : '--'} to ${toD ? fmt(toD) : '--'}`;
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

  // NTK Only / TVK Only / Both for Events pie
  const categoryCounts = useMemo(() => {
    let ntkOnly = 0, tvkOnly = 0, both = 0;
    for (const r of rows) {
      const hasN = !!r.ntkUrl;
      const hasT = !!r.tvkUrl;
      if (hasN && hasT) both++;
      else if (hasN) ntkOnly++;
      else if (hasT) tvkOnly++;
    }
    return { ntkOnly, tvkOnly, both };
  }, [rows]);

  const pieTicks = [
    { name: 'NTK Only', value: categoryCounts.ntkOnly },
    { name: 'TVK Only', value: categoryCounts.tvkOnly },
    { name: 'Both', value: categoryCounts.both }
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
          <p className="opacity-80">A list of all protests or people meet surrounding a particular issue.</p>
        </div>

        <FilterSection onApply={applyFilter} onClear={clearFilter} disabled={loading} />

        

        <div className="mt-4">
          <DataTable
            kind="protests"
            rows={rows}
            searchableKey="issue"
            dateKey="dateDMY"
            onNoteText="Note: ✅ emoji is clickable. Clicking that will take you to the source website."
            appliedLabel={appliedLabel}
          />
        </div>

        {/* Charts moved to bottom */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tile">
            <MiniPie title="Events: NTK Only / TVK Only / Both" data={pieTicks} compact />
          </div>

          <div className="tile">
            <MiniPie title="NTK vs TVK (Speech Minutes)" data={pieSpeech} compact />
          </div>
        </div>

        {/* Modals removed: charts are compact inline */}
      </main>
    </div>
  );
}

