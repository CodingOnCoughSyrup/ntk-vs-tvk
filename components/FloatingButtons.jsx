export function SupportButton() {
  return (
    <div className="floating-left">
      <a
        href="https://x.com/paarytamizhan"
        target="_blank" rel="noopener noreferrer"
        className="tile flex items-center gap-2 px-3 py-2 hover:opacity-90"
        title="Support on X"
      >
        <span className="text-lg">🤝</span>
        <span className="font-medium">Support</span>
      </a>
    </div>
  );
}

export function ManifestoButton({ ntkUrl, tvkUrl }) {
  return (
    <div className="floating-buttons flex flex-col gap-2 items-end">
      <a
        href={ntkUrl}
        target="_blank" rel="noopener noreferrer"
        className="tile px-3 py-2 hover:opacity-90"
        title="NTK Manifesto"
      >
        📄 NTK Manifesto
      </a>
      {tvkUrl ? (
        <a href={tvkUrl} target="_blank" rel="noopener noreferrer"
           className="tile px-3 py-2 hover:opacity-90" title="TVK Manifesto">
          📄 TVK Manifesto
        </a>
      ) : (
        <div className="tile px-3 py-2 opacity-70" title="TVK: No manifesto">
          🚫 TVK: No manifesto
        </div>
      )}
    </div>
  );
}
