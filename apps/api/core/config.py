from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/cap_entreprendre_france"
    redis_url: str = "redis://localhost:6379"
    api_secret: str = "change-me"
    environment: str = "development"

    class Config:
        env_file = "../../.env"


settings = Settings()
