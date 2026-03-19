from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "PathAI Studio API"
    debug: bool = False
    api_secret_key: str

    # Supabase
    supabase_url: str
    supabase_service_role_key: str

    # Database
    database_url: Optional[str] = None

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Stripe
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None

    # HuggingFace
    huggingface_token: Optional[str] = None

    # Modal (serverless GPU)
    modal_token_id: Optional[str] = None
    modal_token_secret: Optional[str] = None

    # Sentry
    sentry_dsn: Optional[str] = None

    # Storage
    storage_bucket: str = "slides"

    # Model versions
    gigapath_version: str = "v1.0"
    uni_version: str = "v2.0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()