# ⚖ Lex Aureon — Constitutional AI Governance

> **Govern AI. Ensure Trust. Defend Truth.**

The first constitutional multi-agent governance system for language models. Built on peer-reviewed mathematics — not guardrails, not filters.

**Live:** [lexaureon.com](https://lexaureon.com) · **Research:** [doi.org/10.5281/zenodo.18944243](https://doi.org/10.5281/zenodo.18944243)

---

## What Is This?

Lex Aureon is a production-ready constitutional control system that governs every AI output through 5 mathematically isolated agents, enforcing C+R+S=1 on a probability simplex with CBF projection and Lyapunov stability guarantees.

```
C (Continuity)  + R (Reciprocity) + S (Sovereignty) = 1
M = min(C, R, S)  →  M < τ = 0.08  →  Governor fires
```

---

## PRAXIS Pipeline Architecture

```
User Prompt
     │
     ▼
┌─────────────────────┐
│  [1] Generator      │  Produces raw output only
│      Agent          │  Cannot approve or govern
└──────────┬──────────┘
           │
     raw_output
           │
           ▼
┌─────────────────────┐
│  [2] CRS Extractor  │  Measures C, R, S, M, Lyapunov V
│      Agent          │  Cannot modify output
└──────────┬──────────┘
           │
     crs_state
           │
           ▼
┌─────────────────────┐
│  [3] Governor       │  Decides PASS or INTERVENE
│      Agent          │  Cannot generate or audit
└──────────┬──────────┘
           │
    PASS ──┼── INTERVENE
           │         │
           │         ▼
           │  ┌─────────────────────┐
           │  │  [4] Intervention   │  Rewrites constitutionally
           │  │      Agent          │  Cannot approve output
           │  └──────────┬──────────┘
           │             │
           └─────────────┘
                   │
             governed_output
                   │
                   ▼
┌─────────────────────┐
│  [5] Auditor        │  Signs SHA-256 receipt
│      Agent          │  Cannot modify anything
└──────────┬──────────┘
           │
    Turso persistence
           │
           ▼
     Final Result + Receipt
```

---

## 5 Constitutional Agents

| Agent | Role | Cannot |
|-------|------|--------|
| Generator | Produce raw output | Approve or govern |
| CRS Extractor | Measure constitutional state | Modify output |
| Governor | Decide intervention | Generate or audit |
| Intervention | Rewrite to restore balance | Approve output |
| Auditor | Sign cryptographic receipt | Modify anything |

> Article III of the Lex Aureon Constitution: *"No single component may generate, govern, and approve the same output."*

---

## Mathematical Framework

| Formula | Meaning |
|---------|---------|
| `C + R + S = 1` | Constitutional simplex constraint |
| `M = min(C, R, S)` | Stability margin |
| `M < τ = 0.08` | Collapse threshold — governor fires |
| `ḣ(x) + α·h(x) ≥ 0` | CBF constraint always enforced |
| `‖dx/dt‖ > δ` | Velocity trigger |
| `V(x) = ‖x - x*‖²` | Lyapunov stability certificate |

---

## Environment Variables

```env
GROQ_API_KEY=your_groq_api_key
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_turso_token
NEXT_PUBLIC_SITE_URL=https://lexaureon.com
```

---

## Local Setup

```bash
git clone https://github.com/omomehinemmanuel5-boop/Lexaureon-frontend
cd Lexaureon-frontend
npm install
cp .env.local.example .env.local
# Fill in your env vars
npm run dev
```

---

## Project Structure

```
├── app/
│   ├── page.tsx              # Landing page
│   ├── console/page.tsx      # Governance console
│   ├── constitution/page.tsx # Lex Aureon Constitution
│   ├── research/page.tsx     # Research foundation
│   ├── audit/[id]/page.tsx   # Shareable audit receipts
│   └── api/
│       ├── lex/run/route.ts  # Main governance endpoint
│       ├── leads/route.ts    # Email capture
│       └── stats/route.ts    # Run counter
├── lib/
│   ├── praxis.ts             # PRAXIS orchestrator
│   ├── agents/               # 5 constitutional agents
│   │   ├── generator.ts
│   │   ├── crs_extractor.ts
│   │   ├── governor.ts
│   │   ├── intervention.ts
│   │   └── auditor.ts
│   └── db.ts                 # Turso persistence
├── components/               # UI components
├── huggingface/              # HuggingFace Space files
└── __tests__/                # Unit tests
```

---

## Research

**Paper:** Aureonics: Constitutional Triadic Framework for Stable Adaptive Intelligence  
**Author:** Emmanuel King · Lagos, Nigeria 🇳🇬  
**DOI:** [10.5281/zenodo.18944243](https://doi.org/10.5281/zenodo.18944243)  
**ORCID:** [0009-0000-2986-4935](https://orcid.org/0009-0000-2986-4935)  
**Contact:** [lexaureon@gmail.com](mailto:lexaureon@gmail.com)

---

## License

© 2025 Emmanuel King · Aureonics Framework · All rights reserved.
