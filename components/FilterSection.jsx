import { useEffect, useState } from 'react';
import FilterBar from './FilterBar';

/**
 * Responsive wrapper for the date FilterBar.
 * - Collapsed by default on all screens; toggle to show/hide.
 */
export default function FilterSection({ onApply, onClear, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <div className="flex items-center justify-end">
        <button
          className="tile px-3 py-2 hover:opacity-90"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen(o => !o)}
          title={open ? 'Hide filters' : 'Show filters'}
        >
          {open ? 'Hide Filter' : 'Show Filter'}
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
