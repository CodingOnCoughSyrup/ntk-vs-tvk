export default function LoadingOverlay({ show, text = 'Loading…' }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="tile text-center">
        <div className="text-2xl mb-2 animate-pulse">⏳</div>
        <div className="font-medium">{text}</div>
        <div className="text-xs opacity-70 mt-1">Please wait, finishing the previous action…</div>
      </div>
    </div>
  );
}
