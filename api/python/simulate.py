"""
Aureonics CBF Simulation — Vercel Python Serverless
Endpoint: /api/python/simulate
Real replicator dynamics + CBF enforcement
"""
import json
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from http.server import BaseHTTPRequestHandler
from cbf_service import simulate_cbf_comparison

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            data = json.loads(body) if body else {}
            steps = min(int(data.get("steps", 100)), 200)
            alpha = float(data.get("alpha", 0.5))
            seed = int(data.get("seed", 42))

            result = simulate_cbf_comparison(
                steps=steps,
                alpha=alpha,
                seed=seed,
            )

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

    def do_GET(self):
        try:
            result = simulate_cbf_comparison(steps=100, alpha=0.5, seed=42)
            summary = {
                "governed_min_M": result["governed"]["min_M"],
                "ungoverned_min_M": result["ungoverned"]["min_M"],
                "safety_guarantee_holds": result["safety_guarantee_holds"],
                "improvement": result["improvement_min_M"],
                "fpl1": result["governed"]["fpl1_classification"],
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(summary).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        pass
