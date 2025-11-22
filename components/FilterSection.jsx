import { useEffect, useState } from 'react';
import FilterBar from './FilterBar';
import { useLanguage } from '../context/LanguageContext';

/**
 * Responsive wrapper for the date FilterBar.
 * - Collapsed by default on all screens; toggle to show/hide.
 */
export default function FilterSection({ onApply, onClear, disabled }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <section>
      <div className="flex items-center justify-end">
        <button
          className="tile px-3 py-2 hover:opacity-90"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen(o => !o)}
          title={open ? t.filter.hide : t.filter.show}
        >
          {open ? t.filter.hide : t.filter.show}
        </button>
      </div>
      {open && (
        <div className="mt-2">
          <FilterBar onApply={onApply} onClear={onClear} disabled={disabled} />
        </div>
      )}
    </section>
  );
}
