from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/immoexpert"
    redis_url: str = "redis://localhost:6379"
    api_secret: str = "change-me"
    environment: str = "development"

    class Config:
        env_file = "../../.env"
        extra = "ignore"

    @field_validator("database_url")
    @classmethod
    def _ensure_async_driver(cls, value: str) -> str:
        """The DATABASE_URL is shared with Prisma (which requires the plain
        `postgresql://` scheme), but the async SQLAlchemy engine needs an async
        driver. Normalize the scheme so the same URL works for both."""
        if value.startswith("postgresql+"):
            return value
        if value.startswith("postgresql://"):
            return "postgresql+asyncpg://" + value[len("postgresql://"):]
        if value.startswith("postgres://"):
            return "postgresql+asyncpg://" + value[len("postgres://"):]
        return value


settings = Settings()
