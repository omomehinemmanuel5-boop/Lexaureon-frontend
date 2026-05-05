from __future__ import annotations

THRESHOLD = 0.15
PILLAR_ORDER = ["Continuity", "Reciprocity", "Sovereignty"]


CORRECTION_LIBRARY = {
    "Continuity": {
        "action": "re-anchor task flow to active project objectives",
        "rationale": "Low continuity signals fragmentation, drift, or loss of governing thread.",
        "expected_shift": "Raise CCP by increasing anchor retention and reducing context breakage.",
        "target_mode": "Analytical",
    },
    "Reciprocity": {
        "action": "increase signal intake and external validation",
        "rationale": "Low reciprocity signals weak coupling to trustworthy feedback or reality checks.",
        "expected_shift": "Raise IEC by improving grounded exchange and reducing detached output drift.",
        "target_mode": "Collaborative",
    },
    "Sovereignty": {
        "action": "repair invalid tasks and tighten lawful decision arbitration",
        "rationale": "Low sovereignty signals brittle execution, over-rigidity, or non-compliant variance.",
        "expected_shift": "Raise ADV by restoring compliant decision flexibility under constraint.",
        "target_mode": "Exploratory",
    },
}


def pillar_scores(continuity: float, reciprocity: float, sovereignty: float) -> dict[str, float]:
    return {
        "Continuity": round(float(continuity), 4),
        "Reciprocity": round(float(reciprocity), 4),
        "Sovereignty": round(float(sovereignty), 4),
    }


def violated_pillars(continuity: float, reciprocity: float, sovereignty: float, tau: float = THRESHOLD) -> list[str]:
    scores = pillar_scores(continuity, reciprocity, sovereignty)
    return [pillar for pillar in PILLAR_ORDER if scores[pillar] < tau]


def weakest_pillar(continuity: float, reciprocity: float, sovereignty: float) -> str:
    scores = pillar_scores(continuity, reciprocity, sovereignty)
    return min(scores, key=scores.get)


def stability_margin(continuity: float, reciprocity: float, sovereignty: float) -> float:
    return round(min(continuity, reciprocity, sovereignty), 4)


def constitutional_band(
    continuity: float,
    reciprocity: float,
    sovereignty: float,
    tau: float = THRESHOLD,
) -> str:
    margin = min(continuity, reciprocity, sovereignty)
    if margin < max(tau * 0.5, 0.05):
        return "collapse-risk"
    if margin < tau:
        return "intervention"
    if margin < min(1.5 * tau, 0.35):
        return "watch"
    return "stable-core"


def governance_pressure(continuity: float, reciprocity: float, sovereignty: float, tau: float = THRESHOLD) -> float:
    deficits = [max(0.0, tau - score) for score in (continuity, reciprocity, sovereignty)]
    pressure = sum(deficits) / (3.0 * max(tau, 1e-9))
    return round(min(1.0, pressure), 4)


def target_mode(continuity: float, reciprocity: float, sovereignty: float) -> str:
    weakest = weakest_pillar(continuity, reciprocity, sovereignty)
    return CORRECTION_LIBRARY[weakest]["target_mode"]


def correction_for_pillar(pillar: str, deficit: float) -> dict[str, str | float]:
    template = CORRECTION_LIBRARY[pillar]
    severity = "high" if deficit >= 0.10 else "medium" if deficit >= 0.04 else "low"
    return {
        "pillar": pillar,
        "severity": severity,
        "deficit": round(deficit, 4),
        "action": template["action"],
        "rationale": template["rationale"],
        "expected_shift": template["expected_shift"],
        "target_mode": template["target_mode"],
    }


def governor_state(continuity: float, reciprocity: float, sovereignty: float, tau: float = THRESHOLD) -> dict:
    scores = pillar_scores(continuity, reciprocity, sovereignty)
    violated = violated_pillars(continuity, reciprocity, sovereignty, tau)
    weakest = weakest_pillar(continuity, reciprocity, sovereignty)
    deficits = {pillar: round(max(0.0, tau - score), 4) for pillar, score in scores.items()}
    corrections = [correction_for_pillar(pillar, deficits[pillar]) for pillar in violated]
    margin = stability_margin(continuity, reciprocity, sovereignty)
    band = constitutional_band(continuity, reciprocity, sovereignty, tau)
    pressure = governance_pressure(continuity, reciprocity, sovereignty, tau)

    return {
        "active": len(violated) > 0,
        "tau": round(tau, 4),
        "scores": scores,
        "stability_margin": margin,
        "weakest_pillar": weakest,
        "violated_pillars": violated,
        "deficits": deficits,
        "constitutional_band": band,
        "governance_pressure": pressure,
        "target_mode": CORRECTION_LIBRARY[weakest]["target_mode"],
        "corrections": corrections,
    }


def governor_policy(state: dict) -> dict[str, object]:
    weakest = state["weakest_pillar"]
    active = bool(state["active"])
    pressure = float(state["governance_pressure"])
    band = state["constitutional_band"]
    routing_bias = state["target_mode"] if active else "Balanced"
    review_intensity = "high" if band == "collapse-risk" else "medium" if active else "low"
    metric_required = active or weakest in {"Continuity", "Sovereignty"}
    signal_policy = "increase-external-validation" if weakest == "Reciprocity" else "maintain"
    execution_policy = {
        "stable-core": "allow-normal-flow",
        "watch": "monitor-and-sample",
        "intervention": "governor-biased-routing",
        "collapse-risk": "restrict-and-repair",
    }[band]
    return {
        "routing_bias": routing_bias,
        "review_intensity": review_intensity,
        "metric_required": metric_required,
        "signal_policy": signal_policy,
        "execution_policy": execution_policy,
        "pressure_band": "high" if pressure >= 0.5 else "medium" if pressure > 0 else "low",
    }


def compute_alert(continuity: float, reciprocity: float, sovereignty: float) -> tuple[str, str]:
    state = governor_state(continuity, reciprocity, sovereignty, THRESHOLD)
    weakest = state["weakest_pillar"]
    if not state["active"]:
        if state["constitutional_band"] == "watch":
            return weakest, f"System stable but near watch band; monitor {weakest.lower()} closely"
        return weakest, "System stable within constitutional region"

    action = CORRECTION_LIBRARY[weakest]["action"]
    band = state["constitutional_band"]
    if band == "collapse-risk":
        return weakest, f"{weakest} collapse-risk: {action}"
    return weakest, f"{weakest} intervention required: {action}"
