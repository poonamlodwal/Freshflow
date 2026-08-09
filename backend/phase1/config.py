"""
config.py
---------
Centralised settings loaded from environment variables.
All modules import `settings` from here — never read os.environ directly.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Model ──────────────────────────────────────────────────────────────
    # Swap this to any compatible HF image-classification model ID.
    HF_MODEL_ID: str = "jazzmacedo/fruits-and-vegetables-detector-36"

    # ── Database ───────────────────────────────────────────────────────────
    # SQLite by default for local dev; use asyncpg Postgres URI for production.
    # SQLite:   "sqlite+aiosqlite:///./freshchain.db"
    # Postgres: "postgresql+asyncpg://user:pass@host/db"
    DATABASE_URL: str = "sqlite+aiosqlite:///./freshchain.db"

    # ── CORS ───────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins for the Next.js frontend.
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── Shelf-life thresholds (days) ───────────────────────────────────────
    # These drive the rule-based shelf-life estimate returned with each prediction.
    SHELF_LIFE_FRESH_DAYS: int = 7
    SHELF_LIFE_EXPIRING_DAYS: int = 2   # label contains "ripe" or confidence is borderline
    SHELF_LIFE_ROTTEN_DAYS: int = 0

    # Batches at or below this many days are flagged as near-expiry.
    NEAR_EXPIRY_THRESHOLD: int = 3

    # ── HTTP timeouts (seconds) ────────────────────────────────────────────
    IMAGE_FETCH_TIMEOUT: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse ALLOWED_ORIGINS string into a list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the singleton Settings instance (cached after first call)."""
    return Settings()


# Module-level convenience alias used throughout the codebase.
settings: Settings = get_settings()
