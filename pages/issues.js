// pages/issues.js
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import FilterSection from '../components/FilterSection';
import Modal from '../components/Modal';
import { MiniPie } from '../components/ChartsMini';
import LoadingOverlay from '../components/LoadingOverlay';
import { parseDMY, isWithinRange, rangeFromPreset } from '../utils/date';

export default function IssuesPage() {
  const [raw, setRaw] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [appliedLabel, setAppliedLabel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/issues');
        const j = await r.json();
        if (active && j.ok) {
          setRaw(j.data || []);
          setRows(j.data || []); // default: no filter
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

    // label
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

  const counts = useMemo(() => {
    const ntk = rows.filter(r => !!r.ntkUrl).length;
    const tvk = rows.filter(r => !!r.tvkUrl).length;
    return { ntk, tvk };
  }, [rows]);

  const pieData = [
    { name: 'NTK', value: counts.ntk },
    { name: 'TVK', value: counts.tvk }
  ];

  return (
    <div className="min-h-screen bg-abstract">
      <LoadingOverlay show={filtering || loading} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Navbar />
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">Issues Addressed</h2>
          <p className="opacity-80">Table first, mini-charts second. Click ✅ to open posts (masked behind emoji).</p>
        </div>

        <FilterSection onApply={applyFilter} onClear={clearFilter} disabled={loading} />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tile">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">NTK vs TVK (Addressed)</div>
              <button className="px-3 py-1 rounded-lg bg-gray-200/70 dark:bg-white/10"
                onClick={() => setModalOpen(true)}>Expand</button>
            </div>
            <MiniPie data={pieData} />
          </div>
          
          <div className="tile">
            <div className="font-semibold mb-2">Quick View</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-3 w-1/2"></th>
                    <th className="py-2 px-3">NTK</th>
                    <th className="py-2 px-3">TVK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-black/5 dark:border-white/10">
                    <td className="py-2 pr-3 font-medium">No of Issues</td>
                    <td className="py-2 px-3">{counts.ntk}</td>
                    <td className="py-2 px-3">{counts.tvk}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div className="mt-4">
          <DataTable
            kind="issues"
            rows={rows}
            searchableKey="issue"
            dateKey="dateDMY"
            onNoteText="Note: ✅ emoji is clickable. A confirmation pops before opening the external site."
            appliedLabel={appliedLabel}
          />
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Issues — Full Size Chart">
          <MiniPie data={pieData} />
        </Modal>
      </main>
    </div>
  );
}
