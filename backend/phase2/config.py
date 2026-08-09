"""
config.py
---------
Configuration settings for Phase 2 Near-Expiry Marketplace Backend.
Loaded from environment variables using pydantic-settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ───────────────────────────────────────────────────────────
    # SQLite by default for local dev; swap to Postgres URI for production.
    DATABASE_URL: str = "sqlite+aiosqlite:///./phase2_freshchain.db"

    # ── CORS ───────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── Thresholds ─────────────────────────────────────────────────────────
    # Batches at or below this shelf life (in days) auto-trigger listing suggestions.
    NEAR_EXPIRY_THRESHOLD: int = 3

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
