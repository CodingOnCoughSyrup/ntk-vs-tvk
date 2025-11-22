// pages/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import TileCard from '../components/TileCard';
import { ManifestoButton, SupportButton } from '../components/FloatingButtons';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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

  const issuesPie = totals ? (
    (typeof totals?.issues?.both === 'number')
      ? [
        { name: t.charts.ntkOnly, value: totals?.issues?.ntkOnly ?? 0 },
        { name: t.charts.tvkOnly, value: totals?.issues?.tvkOnly ?? 0 },
        { name: t.charts.both, value: totals?.issues?.both ?? 0 },
      ]
      : [
        { name: t.charts.ntk, value: totals?.issues?.ntk ?? 0 },
        { name: t.charts.tvk, value: totals?.issues?.tvk ?? 0 },
      ]
  ) : [];

  const protestsPie = totals ? (
    (typeof totals?.protests?.both === 'number')
      ? [
        { name: t.charts.ntkOnly, value: totals?.protests?.ntkOnly ?? 0 },
        { name: t.charts.tvkOnly, value: totals?.protests?.tvkOnly ?? 0 },
        { name: t.charts.both, value: totals?.protests?.both ?? 0 },
      ]
      : [
        { name: t.charts.ntk, value: totals?.protests?.ntk ?? 0 },
        { name: t.charts.tvk, value: totals?.protests?.tvk ?? 0 },
      ]
  ) : [];

  const pressPie = totals ? [
    { name: t.charts.ntk, value: totals?.press?.ntk ?? 0 },
    { name: t.charts.tvk, value: totals?.press?.tvk ?? 0 },
  ] : [];

  const confPie = totals ? [
    { name: t.charts.ntk, value: totals?.conference?.ntk ?? 0 },
    { name: t.charts.tvk, value: totals?.conference?.tvk ?? 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-abstract">
      <ThemeToggle />
      <LanguageToggle />
      <SupportButton />
      <ManifestoButton
        ntkUrl="https://www.naamtamilar.org/downloads/naam-tamilar-seyarpaattu-varaivu-download.pdf"
        tvkUrl={null}
      />

      <main className="max-w-6xl mx-auto px-4 pt-14 md:pt-8 pb-8 flex flex-col items-center">
        <section className="text-center mt-6 md:mt-8">
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight mb-2 animate-float">
            {t.title}
          </h1>
          <p className="opacity-80 text-base md:text-lg">{t.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-6 w-full max-w-2xl mx-auto">
            <Link href="/issues" className="tile w-full text-center px-5 py-4 md:px-6 md:py-5 text-lg md:text-xl font-semibold hover:opacity-90">{t.nav.issues}</Link>
            <Link href="/protests" className="tile w-full text-center px-5 py-4 md:px-6 md:py-5 text-lg md:text-xl font-semibold hover:opacity-90">{t.nav.protests}</Link>
            <Link href="/press-meets" className="tile w-full text-center px-5 py-4 md:px-6 md:py-5 text-lg md:text-xl font-semibold hover:opacity-90">{t.nav.press}</Link>
            <Link href="/conferences" className="tile w-full text-center px-5 py-4 md:px-6 md:py-5 text-lg md:text-xl font-semibold hover:opacity-90">{t.nav.conferences}</Link>
          </div>
        </section>

        <section className="w-full mt-6 md:mt-8">
          <div className="w-full max-w-2xl mx-auto mb-4">
            <div className="rounded-lg border border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 px-4 py-3 flex items-start gap-2 shadow-sm" role="note">
              <span className="text-lg" aria-hidden>⚠️</span>
              <p className="text-sm md:text-base">{t.note}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            <TileCard
              icon="📌"
              title={t.cards.issues.title}
              bigNumber={totals?.issues?.total ?? 0}
              subText={t.cards.issues.sub}
              pieData={issuesPie}
              compact
            />
            <TileCard
              icon="✊"
              title={t.cards.protests.title}
              bigNumber={totals?.protests?.total ?? 0}
              subText={t.cards.protests.sub}
              pieData={protestsPie}
              compact
            />
            <TileCard
              icon="🎙️"
              title={t.cards.press.title}
              bigNumber={totals?.press?.total ?? 0}
              subText={t.cards.press.sub}
              pieData={pressPie}
              compact
            />
            <TileCard
              icon="🏛️"
              title={t.cards.conferences.title}
              bigNumber={totals?.conference?.total ?? 0}
              subText={t.cards.conferences.sub}
              pieData={confPie}
              compact
            />
            <div className="tile relative">
              <div className="absolute top-3 right-3 text-xl">⏱️</div>
              <div className="text-xs opacity-70">{t.cards.speech.title}</div>
              <div className="text-base font-semibold mt-1">{t.cards.speech.lifetime}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="tile">
                  <div className="opacity-70 text-xs">{t.charts.ntk}</div>
                  <div className="text-xl font-bold">{totals?.speechMinutes?.ntk ?? 0}</div>
                </div>
                <div className="tile">
                  <div className="opacity-70 text-xs">{t.charts.tvk}</div>
                  <div className="text-xl font-bold">{totals?.speechMinutes?.tvk ?? 0}</div>
                </div>
              </div>
              <div className="mt-1 text-[11px] opacity-70">{t.cards.speech.sub}</div>
            </div>
          </div>


        </section>

        {/* Quotes */}
        <section className="w-full grid md:grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8 mb-32 md:mb-40">
          <blockquote className="tile italic text-base md:text-lg">
            &ldquo;{t.quotes.mandela}&rdquo;<br />
            <span className="not-italic text-sm opacity-70">&mdash; {t.quotes.mandelaAuthor}</span>
          </blockquote>
          <blockquote className="tile italic text-base md:text-lg">
            &ldquo;{t.quotes.anonymous}&rdquo;<br />
            <span className="not-italic text-sm opacity-70">&mdash; {t.quotes.anonymousAuthor}</span>
          </blockquote>
        </section>
      </main>
    </div>
  );
}
