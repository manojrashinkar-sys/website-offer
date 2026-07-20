from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./website_promotion.db"
    cors_origins: str = "http://localhost:5173"

    admin_api_token: str = ""

    rate_limit_max_submissions: int = 5
    rate_limit_window_minutes: int = 60
    duplicate_window_hours: int = 24

    business_name: str = ""
    contact_email: str = ""
    contact_phone: str = ""
    business_location: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def sqlalchemy_database_url(self) -> str:
        """Render (and most managed Postgres hosts) hand out connection
        strings starting with 'postgres://', a scheme SQLAlchemy 2.x no
        longer recognises — it needs 'postgresql://'."""
        if self.database_url.startswith("postgres://"):
            return "postgresql://" + self.database_url[len("postgres://"):]
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
