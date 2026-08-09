"""
services/shelf_life.py — Rule-based shelf-life lookup table (v1).

Per memory.md open question: shelf-life estimation is rule-based for v1,
not model-predicted. Every produce type from the HF model
(jazzmacedo/fruits-and-vegetables-detector-36, 36 classes) is covered.

Returns estimated days remaining when FRESH.
When ROTTEN, always returns 0 (consume/discard immediately).
"""

from __future__ import annotations

# ── Constants ────────────────────────────────────────────────────────────────

FRESH_STATUS = "fresh"
ROTTEN_STATUS = "rotten"

# Shelf-life in days at room temperature (~20 °C) for fresh produce.
# Sources: USDA post-harvest guidelines, FAO storage charts.
_SHELF_LIFE_DAYS: dict[str, int] = {
    # Fruits
    "apple": 14,
    "banana": 5,
    "cherry": 5,
    "grape": 7,
    "guava": 4,
    "kiwi": 7,
    "lemon": 14,
    "lime": 14,
    "mango": 5,
    "melon": 5,
    "orange": 14,
    "papaya": 4,
    "peach": 4,
    "pear": 7,
    "pineapple": 5,
    "plum": 5,
    "pomegranate": 14,
    "strawberry": 3,
    "watermelon": 7,
    # Vegetables
    "bell pepper": 7,
    "broccoli": 5,
    "cabbage": 14,
    "capsicum": 7,
    "carrot": 14,
    "cauliflower": 5,
    "chilli pepper": 7,
    "corn": 3,
    "cucumber": 7,
    "eggplant": 5,
    "garlic": 60,
    "ginger": 14,
    "onion": 30,
    "potato": 21,
    "spinach": 3,
    "sweet potato": 14,
    "tomato": 7,
}

# Default for unknown produce types — conservative estimate
_DEFAULT_FRESH_DAYS = 5


# ── Public API ────────────────────────────────────────────────────────────────

def estimate_shelf_life(produce_type: str, fresh_status: str) -> int:
    """
    Return estimated remaining shelf-life in days.

    Args:
        produce_type: Normalised produce name from the HF model label.
        fresh_status: "fresh" or "rotten".

    Returns:
        0 if rotten; looked-up (or default) days if fresh.
    """
    if fresh_status == ROTTEN_STATUS:
        return 0

    key = _normalise(produce_type)
    return _SHELF_LIFE_DAYS.get(key, _DEFAULT_FRESH_DAYS)


def _normalise(produce_type: str) -> str:
    """Strip whitespace, lowercase, so lookup is case/space tolerant."""
    return produce_type.strip().lower()
