// pages/protests.js
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import DataTable from '../components/DataTable';
import FilterSection from '../components/FilterSection';
import { MiniPie } from '../components/ChartsMini';
import LoadingOverlay from '../components/LoadingOverlay';
import { parseDMY, isWithinRange, rangeFromPreset } from '../utils/date';
import { useLanguage } from '../context/LanguageContext';

export default function ProtestsPage() {
  const [raw, setRaw] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [appliedLabel, setAppliedLabel] = useState(null);
  const { language, t } = useLanguage();

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

  // Translate rows based on language
  const displayRows = useMemo(() => {
    if (language === 'en') return rows;
    return rows.map(r => ({
      ...r,
      issue: r.issue_ta || r.issue // fallback
    }));
  }, [rows, language]);

  function applyFilter({ preset, from, to }) {
    setFiltering(true);

    let fromD = null, toD = null;
    if (from) { const d = new Date(from); fromD = new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    if (to) { const d = new Date(to); toD = new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

    if (!fromD && !toD) {
      const p = rangeFromPreset(preset || 'all');
      fromD = p.start; toD = p.end;
    }

    const filtered = (raw || []).filter(r => {
      const d = parseDMY(r.dateDMY);
      return isWithinRange(d, fromD, toD);
    });

    let label = `${t.common.showing}: ${t.common.lifeTime}`;
    if (fromD || toD) {
      const fmt = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      label = `${t.common.showing}: ${fromD ? fmt(fromD) : '--'} to ${toD ? fmt(toD) : '--'}`;
    } else if (preset && preset !== 'all') {
      const map = {
        '1m': t.filter.presets.m1,
        '3m': t.filter.presets.m3,
        '6m': t.filter.presets.m6,
        '1y': t.filter.presets.y1
      };
      label = `${t.common.showing}: ${map[preset] || t.common.lifeTime}`;
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
    { name: t.charts.ntkOnly, value: categoryCounts.ntkOnly },
    { name: t.charts.tvkOnly, value: categoryCounts.tvkOnly },
    { name: t.charts.both, value: categoryCounts.both }
  ];
  const pieSpeech = [
    { name: t.charts.ntk, value: counts.ntkSpeech },
    { name: t.charts.tvk, value: counts.tvkSpeech }
  ];

  return (
    <div className="min-h-screen bg-abstract">
      <LoadingOverlay show={filtering || loading} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Navbar />
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">{t.cards.protests.title}</h2>
          <p className="opacity-80">{t.cards.protests.sub}</p>
        </div>

        <FilterSection onApply={applyFilter} onClear={clearFilter} disabled={loading} />



        <div className="mt-4">
          <DataTable
            kind="protests"
            rows={displayRows}
            searchableKey="issue"
            dateKey="dateDMY"
            onNoteText="Note: ✅ emoji is clickable. Clicking that will take you to the source website."
            appliedLabel={appliedLabel}
          />
        </div>

        {/* Charts moved to bottom */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="tile">
            <MiniPie title={t.titles.protestsPie} data={pieTicks} compact />
          </div>

          <div className="tile">
            <MiniPie title={t.titles.speechPie} data={pieSpeech} compact />
          </div>
        </div>

        {/* Modals removed: charts are compact inline */}
      </main>
    </div>
  );
}

