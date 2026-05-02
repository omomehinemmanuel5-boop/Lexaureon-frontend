export default function Header({ apiCalls }: { apiCalls: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Lex Aureon
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Governed Intelligence & Safety Monitoring
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">API Calls Used</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400">
            {apiCalls}<span className="text-sm text-slate-500">/10</span>
          </div>
        </div>
      </div>
    </header>
  );
}
