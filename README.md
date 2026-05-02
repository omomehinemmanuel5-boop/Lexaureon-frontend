# Lex Aureon Console

**A state-space control system for language generation. Real-time monitoring, correction, and governance.**

## Overview

Lex Aureon is a production-ready **intelligence safety monitoring and governance console** that connects to your backend API to:

- **Monitor** AI system health across three pillars: Continuity (C), Reciprocity (R), Sovereignty (S)
- **Pre-evaluate** prompts with dynamic heuristics before governance execution
- **Visualize** constitutional state space using barycentric simplex representation
- **Execute** governed inference with real-time metrics
- **Audit** all outputs with transparency and compliance logging
- **Compare** raw vs governed outputs with detailed diff visualization

### Technology

- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** for mobile-first responsive design
- **React Hooks** for state management
- **SVG** for barycentric simplex visualization
- **No external dependencies** (vanilla JavaScript visualization)

---

## Features

### 1. **Input Console**
- Clean textarea for prompts
- Real-time character count
- Smart "Run Governance" button with state validation

### 2. **Pre-Evaluation (Heuristic)**
- Live signal detection as user types
- Dynamic risk classification (low/medium/high)
- Predicted C, R, S scores from heuristic engine
- Confidence scoring based on prompt length
- Signal families:
  - 🎯 Sycophancy (agreement-seeking)
  - 🔒 Refusal Bypass (constraint evasion)
  - 👤 Identity Reframing (persona shifting)
  - 🔄 Distribution Shift (semantic variation)
  - ⚔️ Adversarial (absolutist patterns)

### 3. **Execution Results**
- **Raw Output**: Unmodified model response
- **Governed Output**: Governor-constrained response
- **Diff View**: Side-by-side comparison with:
  - Red strikethrough for removed text
  - Green highlight for added text
  - Unchanged content in neutral styling

### 4. **Constitutional State Space**
- **Barycentric Triangle Visualization**
  - C (Continuity) at top → blue
  - R (Reciprocity) at left → green
  - S (Sovereignty) at right → purple
  - Current state position shown as gold dot
  - Safe zone (τ threshold) rendered with dashed boundary

- **Metrics Display**
  - C, R, S individual scores (0-100%)
  - M (Stability Margin) = min(C, R, S)
  - Governor activation indicator when M < τ (0.15)

### 5. **Audit Panel**
- Detailed metric cards with progress bars
- Governor status badge (NOMINAL / INTERVENTION ACTIVE)
- Intervention reason and explanation
- Mathematical formulas and threshold information
- Full compliance audit trail

### 6. **Upgrade Gate**
- Free tier: 10 API calls per session (localStorage tracked)
- After 10 calls: clean modal prompting upgrade
- Contact information for enterprise deals

---

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Configuration

Update `.env.local`:
```bash
NEXT_PUBLIC_LEX_API_BASE_URL=https://api.lexaureon.com
```

---

## Deployment to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel deploy

# Set production domain
vercel domains add lexaureon.com
```

Or connect your GitHub repo directly in Vercel dashboard.

---

## Project Structure

```
lexaureon/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── InputConsole.tsx
│   ├── PreEvalPanel.tsx
│   ├── ResultsPanel.tsx
│   ├── SimplexVisualization.tsx
│   ├── AuditPanel.tsx
│   └── UpgradeModal.tsx
├── types/
│   └── index.ts
├── .env.local
└── package.json
```

---

## API Response Format

The backend should return:

```json
{
  "raw_output": "string",
  "governed_output": "string",
  "metrics": {
    "c": 0.34,
    "r": 0.45,
    "s": 0.21,
    "m": 0.21
  },
  "intervention": {
    "triggered": true,
    "reason": "R collapse"
  },
  "diff": {
    "removed": ["unsafe text"],
    "added": ["safe alternative"],
    "unchanged": ["neutral text"]
  }
}
```

---

## Customization

### Change Threshold
Edit `app/page.tsx` line 149: `threshold={0.15}`

### Modify Signals
Edit `detectSignals()` function in `app/page.tsx`

### Change Free Call Limit
Edit line 87: `if (apiCalls >= 10)`

---

## Performance

- Build time: ~7-10 seconds
- Page load: <1.5s on 4G
- Pre-eval latency: <50ms
- Bundle size: ~45KB gzipped

---

## Support

- Email: support@lexaureon.com
- GitHub Issues: [repo-url]/issues
- Documentation: https://lexaureon.com/docs

---

**Built for intelligent, safe AI governance.**
