"""
Aureonics Real Governor — Vercel Python Serverless Function
Endpoint: /api/python/govern
Real CBF + CCP + IEC + ADV math from Aureonics-OS
"""
import json
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from http.server import BaseHTTPRequestHandler
from governor_service import governor_state, governor_policy
from metrics_service import compute_ccp, compute_iec, compute_adv
from cbf_service import simulate_cbf, lyapunov_candidate

TAU = 0.08

def _normalize(c, r, s):
    total = c + r + s
    if total <= 0:
        return 1/3, 1/3, 1/3
    return c/total, r/total, s/total

def _project_to_simplex(c, r, s, floor=0.05):
    vals = [c, r, s]
    vals = [max(v, floor) for v in vals]
    total = sum(vals)
    return [v/total for v in vals]

def _health_band(m):
    if m >= 0.25: return "OPTIMAL"
    if m >= 0.15: return "ALERT"
    if m >= 0.08: return "STRESSED"
    return "CRITICAL"

def run_real_governor(prompt: str, raw_output: str, governed_output: str) -> dict:
    """
    Run real Aureonics math on actual LLM outputs.
    Uses cosine similarity, entropy, and ADV from metrics_service.
    """
    # CCP — Continuity: how coherent is governed vs prompt
    ccp_result = compute_ccp(
        anchor_context=prompt,
        responses=[raw_output, governed_output]
    )
    c_raw = ccp_result["ccp"]

    # IEC — Reciprocity: input/output exchange stability
    iec_result = compute_iec(pairs=[
        (prompt, raw_output),
        (prompt, governed_output)
    ])
    r_raw = iec_result["iec"]

    # ADV — Sovereignty: variance between raw and governed
    # If outputs differ = system exercised sovereignty
    decisions = ["raw", "governed"] if raw_output != governed_output else ["raw", "raw"]
    compliance_flags = [True, True]  # both are within system constraints
    adv_result = compute_adv(decisions, compliance_flags)
    s_raw = adv_result["adv"]

    # Normalize to simplex
    c, r, s = _normalize(c_raw, r_raw, s_raw)

    # CBF floor projection
    projected = _project_to_simplex(c, r, s, floor=0.05)
    c, r, s = projected[0], projected[1], projected[2]

    # Stability margin
    m = min(c, r, s)

    # Lyapunov
    V = lyapunov_candidate([c, r, s])

    # Governor state
    gov = governor_state(c, r, s, tau=TAU)
    policy = governor_policy(gov)

    # Health band
    health = _health_band(m)

    # Run CBF simulation for trajectory (fast, 50 steps)
    sim = simulate_cbf(steps=50, dt=1.0, seed=42, alpha=0.5, cbf_enabled=True)

    return {
        "c": round(c, 4),
        "r": round(r, 4),
        "s": round(s, 4),
        "m": round(m, 4),
        "lyapunov_v": round(V, 6),
        "health_band": health,
        "intervention_triggered": gov["active"],
        "weakest_pillar": gov["weakest_pillar"],
        "constitutional_band": gov["constitutional_band"],
        "governance_pressure": gov["governance_pressure"],
        "corrections": gov["corrections"],
        "policy": policy,
        "ccp_detail": ccp_result,
        "iec_detail": iec_result,
        "adv_detail": adv_result,
        "sim_min_m": sim["min_M"],
        "sim_safety_holds": not sim["safety_violated"],
        "fpl1": sim["fpl1_classification"],
    }


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            data = json.loads(body)
            prompt = data.get("prompt", "")
            raw_output = data.get("raw_output", "")
            governed_output = data.get("governed_output", raw_output)

            result = run_real_governor(prompt, raw_output, governed_output)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        pass
