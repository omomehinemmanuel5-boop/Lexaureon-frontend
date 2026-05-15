# Lex Aureon — Project Context for Claude Code

## Identity
- Project: Lex Aureon · Constitutional AI Governance System
- Framework: Aureonics (C + R + S = 1)
- Founder: Omomehin Emmanuel King
- Location: Lagos, Nigeria
- Live URL: https://lexaureon.com
- API: https://lexaureon.com/api/lex/run
- GitHub: https://github.com/omomehinemmanuel5-boop/Lexaureon-frontend
- Paper DOI: https://doi.org/10.5281/zenodo.18944243
- X: @lexAureon
- Email: omomehinemmanuel5@gmail.com

## Stack
- Framework: Next.js 15.5 / TypeScript / React
- Database: Turso (libsql) — persistent constitutional state
- Hosting: Vercel — auto-deploys on push to main
- Auth: Custom JWT
- Payments: Multi-coin crypto (BTC, ETH, SOL, BNB, XRP)

## Key Files
- lib/kv.ts — Turso client + all z_traj functions
- lib/praxis.ts — PRAXIS constitutional governor pipeline
- app/api/lex/run/route.ts — Main governance endpoint
- app/console/page.tsx — Constitutional terminal UI
- app/audit/[id]/page.tsx — Audit receipt viewer
- app/admin/page.tsx — Admin dashboard
- components/SimplexVisualizer.tsx — Animated simplex
- components/GovernanceFeed.tsx — Live governance feed
- app/page.tsx — Landing page

## Constitutional Constants
- TAU_FLOOR = 0.05
- TAU_RECOVERY = 0.15
- N_MIN = 3
- RECOVERY_RATE = 0.02
- SIGMA_THRESHOLD = 0.25
- K0 = 0.3
- EPSILON_K = 0.01

## Database Tables
- z_traj, praxis_receipts, governor_log, law_impact, leads

## Environment Variables Required
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- ANTHROPIC_API_KEY
- ADMIN_PASSWORD

## Deployment Rules
- Always run npm run build before committing
- Push to main triggers Vercel auto-deploy
- Never hardcode secrets
- Never modify constitutional math without explicit instruction
- Simplex constraint C+R+S=1 must always be preserved

## Code Standards
- TypeScript strict mode
- All Turso queries in lib/kv.ts only
- All governor logic in lib/praxis.ts only
- No console.log in production
- All errors caught and handled

## Services
- AI Governance Audit: $500 — 5 days
- Governance Layer Design: $2,000
- AI Safety Consulting: $75/hour
- Technical Writing: $200-500/piece

## Research
- Paper v2 DOI: 10.5281/zenodo.20183807
- Nine falsifiable predictions: P1-P9
- Three open mathematical problems
- Schmidt Sciences RFP 2026 submitted

---
