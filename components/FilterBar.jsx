import { useState } from 'react';
import { formatDMY } from '../utils/date';
import { useLanguage } from '../context/LanguageContext';

export default function FilterBar({ onApply, onClear, disabled }) {
  const [preset, setPreset] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { t } = useLanguage();

  function apply() {
    onApply({ preset, from, to });
  }

  function clear() {
    setPreset('all'); setFrom(''); setTo(''); onClear();
  }

  return (
    <div className="tile flex flex-wrap gap-3 items-end">
      <div className="flex flex-col">
        <label className="text-sm opacity-70">{t.filter.dateFilter}</label>
        <select
          className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10"
          value={preset}
          onChange={e => setPreset(e.target.value)}
          disabled={disabled}
        >
          <option value="all">{t.filter.presets.all}</option>
          <option value="1m">{t.filter.presets.m1}</option>
          <option value="3m">{t.filter.presets.m3}</option>
          <option value="6m">{t.filter.presets.m6}</option>
          <option value="1y">{t.filter.presets.y1}</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm opacity-70">{t.filter.from}</label>
        <input type="date"
          className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10"
          value={from}
          onChange={e => setFrom(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm opacity-70">{t.filter.to}</label>
        <input type="date"
          className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10"
          value={to}
          onChange={e => setTo(e.target.value)}
          disabled={disabled}
        />
      </div>

      <button onClick={apply} disabled={disabled}
        className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:opacity-90">
        {t.filter.apply}
      </button>
      <button onClick={clear} disabled={disabled}
        className="px-4 py-2 rounded-xl bg-gray-200/70 dark:bg-white/10 hover:opacity-90">
        {t.filter.clear}
      </button>
    </div>
  );
}
