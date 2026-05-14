'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-xs px-3 py-1.5 rounded-lg border font-mono transition-all hover:opacity-80 no-print"
      style={{ borderColor: '#c9a84c40', color: '#c9a84c', background: '#c9a84c08' }}
    >
      🖨 Print
    </button>
  );
}
