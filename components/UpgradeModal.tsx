interface UpgradeModalProps {
  onClose: () => void;
  callsUsed: number;
}

export default function UpgradeModal({ onClose, callsUsed }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
          Free Limit Reached
        </h2>
        <p className="text-slate-400 mb-6">
          You've used {callsUsed} free API calls. Upgrade to continue governing your AI systems.
        </p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="text-sm text-slate-300 mb-4">
            <div className="flex justify-between mb-2">
              <span>Free Tier:</span>
              <span className="font-mono text-slate-100">10 calls</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Pro Tier:</span>
              <span className="font-mono text-blue-400">Unlimited</span>
            </div>
            <div className="flex justify-between">
              <span>Enterprise:</span>
              <span className="font-mono text-purple-400">Custom</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => alert('Upgrade feature coming soon. Contact: sales@lexaureon.com')}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-lg hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
        </div>

        <div className="text-xs text-slate-400 text-center">
          <a href="mailto:sales@lexaureon.com" className="text-blue-400 hover:text-blue-300">
            Contact sales
          </a>
          {' '}for enterprise pricing
        </div>
      </div>
    </div>
  );
}
