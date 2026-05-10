'use client';
import { useState } from 'react';

const BTC_ADDRESS = 'bc1qdkm5g4fz6tw4459k8tufgnc77kc9uczd86gk2c';
const BTC_AMOUNT = '0.00019'; // ~$19 at ~$100k BTC, update as needed
const G = { gold: '#c9a84c', goldL: '#e8c96d', navy: '#07070d', surface: '#0f1017', border: '#1a2030' };

export default function BitcoinUpgradeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'pay' | 'confirm' | 'done'>('pay');
  const [txId, setTxId] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = async () => {
    if (!txId.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'bitcoin_upgrade',
          txId: txId.trim(),
          plan: 'sovereign',
          amount: `${BTC_AMOUNT} BTC`,
        }),
      });
      setStep('done');
    } catch {
      setStep('done');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: G.surface, border: `1px solid ${G.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: `1px solid ${G.border}` }}>
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.15em', color: G.gold, textTransform: 'uppercase' }}>
              Upgrade to Sovereign
            </p>
            <h2 className="text-white font-bold text-lg mt-0.5">Bitcoin Payment</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="p-5">
          {step === 'pay' && (
            <>
              {/* Amount */}
              <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(201,168,76,0.08)', border: `1px solid rgba(201,168,76,0.2)` }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400 text-sm">Amount</span>
                  <span style={{ color: G.gold, fontFamily: 'monospace', fontWeight: 700 }}>$19 / month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">BTC equivalent</span>
                  <span style={{ color: G.gold, fontFamily: 'monospace', fontSize: 13 }}>≈ {BTC_AMOUNT} BTC</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="rounded-xl p-3 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=bitcoin:${BTC_ADDRESS}?amount=${BTC_AMOUNT}`}
                    alt="Bitcoin QR Code"
                    width={160}
                    height={160}
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="rounded-xl p-3 mb-4 flex items-center gap-3" style={{ background: '#060810', border: `1px solid ${G.border}` }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a9ab0', wordBreak: 'break-all', flex: 1 }}>
                  {BTC_ADDRESS}
                </span>
                <button onClick={() => copy(BTC_ADDRESS)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                  style={{ background: copied ? 'rgba(0,229,160,0.15)' : 'rgba(201,168,76,0.15)', color: copied ? '#00e5a0' : G.gold }}>
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>

              <p className="text-slate-500 text-xs text-center mb-4">
                Send exactly <span style={{ color: G.gold }}>{BTC_AMOUNT} BTC</span> to the address above.<br />
                1 confirmation required (~10 min).
              </p>

              <button onClick={() => setStep('confirm')}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, color: '#07070d' }}>
                I&apos;ve Sent the Payment →
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <p className="text-slate-300 text-sm mb-4">
                Enter your transaction ID and email. We&apos;ll verify on the blockchain and send your API key within 30 minutes.
              </p>

              <div className="mb-3">
                <label className="text-xs text-slate-500 mb-1.5 block" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                  TRANSACTION ID (TXID)
                </label>
                <input
                  value={txId}
                  onChange={e => setTxId(e.target.value)}
                  placeholder="e.g. 4a5e1e4baab89f3a32518a88..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: '#060810', border: `1px solid ${G.border}`, fontFamily: 'monospace' }}
                />
              </div>

              <div className="mb-5">
                <label className="text-xs text-slate-500 mb-1.5 block" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                  YOUR EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: '#060810', border: `1px solid ${G.border}` }}
                />
              </div>

              <button onClick={submit} disabled={!txId.trim() || !email.trim() || submitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all mb-3 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, color: '#07070d' }}>
                {submitting ? 'Submitting...' : 'Submit Payment Proof →'}
              </button>

              <button onClick={() => setStep('pay')} className="w-full text-slate-500 text-sm hover:text-slate-300 transition-colors">
                ← Back
              </button>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-white font-bold text-lg mb-2">Payment Received</h3>
              <p className="text-slate-400 text-sm mb-6">
                We&apos;re verifying your transaction on the blockchain.<br />
                Your Sovereign API key will be sent to <span style={{ color: G.gold }}>{email}</span> within 30 minutes.
              </p>
              <button onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, color: '#07070d' }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
