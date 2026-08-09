"""
config.py — single source of truth for all environment variables.
Uses pydantic-settings so values are validated at startup and
never scattered across files.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── ML Model ────────────────────────────────────────────────────────────
    hf_model_id: str = "jazzmacedo/fruits-and-vegetables-detector-36"

    # ── Server ──────────────────────────────────────────────────────────────
    port: int = 8000
    env: str = "development"  # "production" on Render / HF Spaces

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins (Next.js app URL)
    allowed_origins: str = "http://localhost:3000"

    # ── Security ─────────────────────────────────────────────────────────────
    # Shared secret for internal-only endpoints like /retrain
    internal_secret: str = "changeme-use-a-long-random-string-in-prod"

    # ── Derived helpers ───────────────────────────────────────────────────────
    @property
    def origins_list(self) -> list[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a Python list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance (created once per process)."""
    return Settings()
