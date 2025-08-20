export default function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="tile max-w-5xl w-[92vw]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-200/60 dark:bg-white/10">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
