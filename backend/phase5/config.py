"""
config.py
---------
Centralised settings loaded from environment variables for Phase 5 backend.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Model ──────────────────────────────────────────────────────────────
    HF_MODEL_ID: str = "jazzmacedo/fruits-and-vegetables-detector-36"

    # ── Database ───────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./phase5_freshchain.db"

    # ── CORS ───────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── Shelf-life thresholds (days) ───────────────────────────────────────
    SHELF_LIFE_FRESH_DAYS: int = 7
    SHELF_LIFE_EXPIRING_DAYS: int = 2
    SHELF_LIFE_ROTTEN_DAYS: int = 0
    NEAR_EXPIRY_THRESHOLD: int = 3

    # ── HTTP & Retrain timeouts/limits ─────────────────────────────────────
    IMAGE_FETCH_TIMEOUT: int = 10
    DEFAULT_RETRAIN_SAMPLE_LIMIT: int = 100

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
