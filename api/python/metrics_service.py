import json
import math
import statistics
from collections import Counter
from typing import Any

EPSILON = 1e-9
STOPWORDS = {
    "a", "an", "the", "and", "or", "to", "of", "for", "in", "on", "with", "is", "are", "be", "by",
    "this", "that", "it", "as", "at", "from", "into", "across", "under", "over", "up", "down",
}
NEGATION_MARKERS = {"not", "never", "no", "without", "against", "reject", "rejects", "rejecting", "avoid"}


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def safe_ratio(numerator: int | float, denominator: int | float) -> float:
    if denominator == 0:
        return 0.0
    return float(numerator) / float(denominator)


def tokenize(text: str) -> list[str]:
    cleaned = "".join(ch.lower() if ch.isalnum() else " " for ch in text)
    return [tok for tok in cleaned.split() if tok]


def content_tokens(text: str) -> list[str]:
    return [tok for tok in tokenize(text) if tok not in STOPWORDS]


def text_embedding(text: str) -> dict[str, float]:
    tokens = tokenize(text)
    counts = Counter(tokens)
    norm = math.sqrt(sum(v * v for v in counts.values()))
    if norm == 0:
        return {}
    return {k: v / norm for k, v in counts.items()}


def cosine_similarity(text_a: str, text_b: str) -> float:
    vec_a = text_embedding(text_a)
    vec_b = text_embedding(text_b)
    if not vec_a or not vec_b:
        return 0.0
    keys = set(vec_a) | set(vec_b)
    dot = sum(vec_a.get(k, 0.0) * vec_b.get(k, 0.0) for k in keys)
    return clamp01(dot)


def estimate_decay_lambda(similarities: list[float], time_deltas: list[float]) -> float:
    if not similarities:
        return 0.0

    if len(time_deltas) != len(similarities):
        time_deltas = [float(i + 1) for i in range(len(similarities))]

    lambdas = []
    for sim, dt in zip(similarities, time_deltas):
        bounded = max(sim, EPSILON)
        delta = max(dt, EPSILON)
        lambdas.append(-math.log(bounded) / delta)
    return max(0.0, float(statistics.fmean(lambdas))) if lambdas else 0.0


def anchor_coverage(anchor_context: str, response: str) -> float:
    anchor_terms = set(content_tokens(anchor_context))
    if not anchor_terms:
        return 0.0
    response_terms = set(content_tokens(response))
    return clamp01(len(anchor_terms & response_terms) / len(anchor_terms))


def contradiction_penalty(anchor_context: str, response: str) -> float:
    anchor_terms = set(content_tokens(anchor_context))
    if not anchor_terms:
        return 0.0
    response_tokens = tokenize(response)
    penalties = 0
    for idx, token in enumerate(response_tokens[:-1]):
        next_token = response_tokens[idx + 1]
        if token in NEGATION_MARKERS and next_token in anchor_terms:
            penalties += 1
    return clamp01(penalties / max(1, len(anchor_terms)))


def compute_ccp(anchor_context: str, responses: list[str], time_deltas: list[float] | None = None) -> dict[str, float]:
    if not responses:
        return {
            "ccp": 0.0,
            "lambda": 0.0,
            "mean_similarity": 0.0,
            "anchor_coverage": 0.0,
            "contradiction_penalty": 0.0,
        }

    similarities = [cosine_similarity(anchor_context, response) for response in responses]
    coverages = [anchor_coverage(anchor_context, response) for response in responses]
    penalties = [contradiction_penalty(anchor_context, response) for response in responses]
    deltas = time_deltas or [float(i + 1) for i in range(len(similarities))]
    decay_lambda = estimate_decay_lambda(similarities, deltas)
    mean_similarity = float(statistics.fmean(similarities))
    mean_coverage = float(statistics.fmean(coverages))
    mean_penalty = float(statistics.fmean(penalties))

    retention = 0.65 * mean_similarity + 0.35 * mean_coverage
    ccp = clamp01((retention / (1.0 + decay_lambda)) * (1.0 - 0.5 * mean_penalty))
    return {
        "ccp": round(ccp, 4),
        "lambda": round(decay_lambda, 6),
        "mean_similarity": round(mean_similarity, 4),
        "anchor_coverage": round(mean_coverage, 4),
        "contradiction_penalty": round(mean_penalty, 4),
    }


def entropy_proxy(text: str) -> float:
    tokens = tokenize(text)
    if not tokens:
        return 0.0
    unique = len(set(tokens))
    p_base = 1.0 / (1.0 + unique)
    return -math.log(max(p_base, EPSILON))


def compute_iec(pairs: list[tuple[str, str]]) -> dict[str, float]:
    if not pairs:
        return {
            "iec": 0.0,
            "variance": 1.0,
            "mean_ratio": 0.0,
            "alignment": 0.0,
            "stability_component": 0.0,
        }

    ratios = []
    alignments = []
    for input_text, output_text in pairs:
        h_in = entropy_proxy(input_text)
        h_out = entropy_proxy(output_text)
        ratios.append(h_out / (h_in + EPSILON))
        alignments.append(cosine_similarity(input_text, output_text))

    variance = statistics.pvariance(ratios) if len(ratios) > 1 else 0.0
    stability_component = 1.0 / (1.0 + variance)
    mean_alignment = float(statistics.fmean(alignments)) if alignments else 0.0
    iec = clamp01((0.65 * stability_component) + (0.35 * mean_alignment))
    return {
        "iec": round(iec, 4),
        "variance": round(variance, 6),
        "mean_ratio": round(float(statistics.fmean(ratios)), 4),
        "alignment": round(mean_alignment, 4),
        "stability_component": round(stability_component, 4),
    }


def normalized_decision_variance(decisions: list[str]) -> float:
    if not decisions:
        return 0.0
    counts = Counter(decisions)
    n = len(decisions)
    probs = [v / n for v in counts.values()]
    max_entropy = math.log(max(len(counts), 1))
    if max_entropy <= EPSILON:
        return 0.0
    entropy = -sum(p * math.log(max(p, EPSILON)) for p in probs)
    return clamp01(entropy / max_entropy)


def transition_rate(decisions: list[str]) -> float:
    if len(decisions) < 2:
        return 0.0
    changes = sum(1 for i in range(1, len(decisions)) if decisions[i] != decisions[i - 1])
    return clamp01(changes / (len(decisions) - 1))


def compute_adv(decisions: list[str], compliance_flags: list[bool]) -> dict[str, float]:
    if not decisions:
        return {
            "adv": 0.0,
            "variance": 0.0,
            "compliance": 0.0,
            "transition_rate": 0.0,
        }

    variance = normalized_decision_variance(decisions)
    transitions = transition_rate(decisions)
    compliance = safe_ratio(sum(1 for x in compliance_flags if x), len(compliance_flags))
    lawful_variance = (0.7 * variance) + (0.3 * transitions)
    adv = clamp01(lawful_variance * compliance)
    return {
        "adv": round(adv, 4),
        "variance": round(variance, 4),
        "compliance": round(compliance, 4),
        "transition_rate": round(transitions, 4),
    }


def infer_anchor_for_task(task: Any, project_map: dict[str, Any]) -> str:
    project = project_map.get(task.project_id or "")
    if project is None:
        return task.title
    return project.objective


def compute_profile(tasks: list[Any], projects: list[Any] | None = None) -> dict[str, float]:
    projects = projects or []
    project_map = {p.id: p for p in projects}

    completed = [t for t in tasks if t.status == "Done"]
    anchor = " ".join([p.objective for p in projects]) or "system anchor"
    continuity_responses = [t.title for t in completed]
    continuity_deltas = [float(i + 1) for i in range(len(continuity_responses))]
    ccp_result = compute_ccp(anchor, continuity_responses, continuity_deltas)

    reciprocity_pairs = []
    for t in tasks:
        if t.from_signal:
            input_text = infer_anchor_for_task(t, project_map)
            output_text = f"{t.title} {t.task_type or ''} {t.mode or ''}".strip()
            reciprocity_pairs.append((input_text, output_text))
    iec_result = compute_iec(reciprocity_pairs)

    decisions = [(t.task_type or t.mode or "undefined") for t in tasks]
    compliance_flags = [not t.is_invalid for t in tasks]
    adv_result = compute_adv(decisions, compliance_flags)

    c = ccp_result["ccp"]
    r = iec_result["iec"]
    s = adv_result["adv"]
    m = min(c, r, s)

    return {
        "continuity_score": round(c, 4),
        "reciprocity_score": round(r, 4),
        "sovereignty_score": round(s, 4),
        "stability_margin": round(m, 4),
        "ccp_lambda": ccp_result["lambda"],
        "ccp_anchor_coverage": ccp_result["anchor_coverage"],
        "ccp_contradiction_penalty": ccp_result["contradiction_penalty"],
        "iec_variance": iec_result["variance"],
        "iec_alignment": iec_result["alignment"],
        "adv_variance": adv_result["variance"],
        "adv_transition_rate": adv_result["transition_rate"],
    }


def decode_json_array(raw: str) -> list[str]:
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(x) for x in parsed]
    except Exception:
        return []
    return []
