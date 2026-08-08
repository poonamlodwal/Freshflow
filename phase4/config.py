"""
config.py
---------
Configuration settings for Phase 4 Mini ERP Dashboard Backend.
Loaded from environment variables using pydantic-settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ───────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./phase4_freshchain.db"

    # ── CORS & App URLs ───────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    FRONTEND_BASE_URL: str = "http://localhost:3000"

    # ── Thresholds ─────────────────────────────────────────────────────────
    NEAR_EXPIRY_THRESHOLD: int = 3
    # Estimated average weight per batch in kg for waste-saved metrics calculation
    ESTIMATED_KG_PER_BATCH: float = 25.0

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
