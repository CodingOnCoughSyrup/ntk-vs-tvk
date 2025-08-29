// pages/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import TileCard from '../components/TileCard';
import { ManifestoButton, SupportButton } from '../components/FloatingButtons';

export default function Home() {
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/aggregate');
        const j = await r.json();
        if (active && j.ok) setTotals(j.totals);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const note = "Note: All data shown is from November 1, 2024 onward — it’s not entire lifetime. It is after TVK's first politicial conference to save TVK from embarrassment.";

  const issuesPie = totals ? [
    { name: 'NTK', value: totals?.issues?.ntk ?? 0 },
    { name: 'TVK', value: totals?.issues?.tvk ?? 0 },
  ] : [];

  const protestsPie = totals ? [
    { name: 'NTK', value: totals?.protests?.ntk ?? 0 },
    { name: 'TVK', value: totals?.protests?.tvk ?? 0 },
  ] : [];

  const pressPie = totals ? [
    { name: 'NTK', value: totals?.press?.ntk ?? 0 },
    { name: 'TVK', value: totals?.press?.tvk ?? 0 },
  ] : [];

  const confPie = totals ? [
    { name: 'NTK', value: totals?.conference?.ntk ?? 0 },
    { name: 'TVK', value: totals?.conference?.tvk ?? 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-abstract">
      <ThemeToggle />
      <SupportButton />
      <ManifestoButton
        ntkUrl="https://www.naamtamilar.org/downloads/naam-tamilar-seyarpaattu-varaivu-download.pdf"
        tvkUrl={null}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
        <section className="text-center mt-6 md:mt-8">
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight mb-2 animate-float">
            NTK vs TVK - A Detailed Comparison
          </h1>
          <p className="opacity-80 text-base md:text-lg">
            Whom to vote for? Decide for yourself from facts and data.
          </p>

          {/* Primary navigation buttons (prominent on all screens) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-6 w-full max-w-2xl mx-auto">
            <Link href="/issues" className="tile w-full text-center px-5 py-4 md:px-6 md:py-5 text-lg md:text-xl font-semibold hover:opacity-90">Issues Addressed</Link>
            <Link href="/protests" className="tile w-full text-center px-5 py-4 md:px-6 md:py-5 text-lg md:text-xl font-semibold hover:opacity-90">Protest & People Meet</Link>
            <Link href="/press-meets" className="tile w-full text-center px-5 py-4 md:px-6 md:py-5 text-lg md:text-xl font-semibold hover:opacity-90">Press Meets</Link>
            <Link href="/conferences" className="tile w-full text-center px-5 py-4 md:px-6 md:py-5 text-lg md:text-xl font-semibold hover:opacity-90">Conferences</Link>
          </div>
        </section>

        {/* Tiles / Boxes */}
        <section className="w-full mt-6 md:mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            <TileCard
              icon="📌"
              title="Total Issues"
              bigNumber={loading ? '—' : (totals?.issues?.total ?? 0)}
              subText="How many were addressed?"
              pieData={issuesPie}
              compact
            />
            <TileCard
              icon="✊"
              title="Total Protests"
              bigNumber={loading ? '—' : (totals?.protests?.total ?? 0)}
              subText="Confirmed with video evidence"
              pieData={protestsPie}
              compact
            />
            <TileCard
              icon="🎙️"
              title="Total Press Meets"
              bigNumber={loading ? '—' : (totals?.press?.total ?? 0)}
              subText="Press meets logged"
              pieData={pressPie}
              compact
            />
            <TileCard
              icon="🏛️"
              title="Total Conferences"
              bigNumber={loading ? '—' : (totals?.conference?.total ?? 0)}
              subText="Conferences logged"
              pieData={confPie}
              compact
            />
            <div className="tile relative">
              <div className="absolute top-3 right-3 text-xl">🗣️</div>
              <div className="text-xs opacity-70">Speech Time (minutes)</div>
              <div className="text-base font-semibold mt-1">Lifetime (from Nov 1, 2024)</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="tile">
                  <div className="opacity-70 text-xs">NTK</div>
                  <div className="text-xl font-bold">
                    {loading ? '—' : (totals?.speechMinutes?.ntk ?? 0)}
                  </div>
                </div>
                <div className="tile">
                  <div className="opacity-70 text-xs">TVK</div>
                  <div className="text-xl font-bold">
                    {loading ? '—' : (totals?.speechMinutes?.tvk ?? 0)}
                  </div>
                </div>
              </div>
              <div className="mt-1 text-[11px] opacity-70">
                Sum of Protest + Press + Conference minutes.
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs md:text-sm opacity-80">{note}</div>
        </section>

        {/* Quotes */}
        <section className="w-full grid md:grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8 mb-32 md:mb-40">
          <blockquote className="tile italic text-base md:text-lg">
            “Only mass action can bring about change. The courts, the laws, and the government are instruments of those in power — it is the people in struggle who force them to act.”<br />
            <span className="not-italic text-sm opacity-70">— Nelson Mandela</span>
          </blockquote>
          <blockquote className="tile italic text-base md:text-lg">
            “A party that protests is alive with the people, forcing change in the streets today. A party that only files court cases is buying time, trapped in papers and procedures that stretch for years. Protest shakes the system now; courtrooms delay and distract.”<br />
            <span className="not-italic text-sm opacity-70">— Anonymous</span>
          </blockquote>
        </section>
      </main>
    </div>
  );
}



