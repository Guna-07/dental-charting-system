"""Centralized, typed application configuration.

All runtime configuration is read from environment variables (loaded from a local
``.env`` file in development) exactly once, here, and consumed everywhere else via
the ``settings`` singleton.
"""

from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    MONGODB_URI: str = Field(..., description="MongoDB connection string")
    DATABASE_NAME: str = Field(default="dental_charting")
    APP_ENV: str = Field(default="development")
    LOG_LEVEL: str = Field(default="INFO")
    # NoDecode: stop pydantic-settings from JSON-parsing this env value so the
    # validator below can accept a plain comma-separated string.
    CORS_ORIGINS: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        """Accept a comma-separated string (or JSON list) from the environment."""
        if isinstance(value, str):
            raw = value.strip()
            if raw.startswith("["):
                import json

                return json.loads(raw)
            return [origin.strip() for origin in raw.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
