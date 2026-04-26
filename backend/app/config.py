from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "Mega API"
    debug: bool = True
    api_secret_key: str = "dev-secret-key"

    # Supabase
    supabase_url: str = "https://placeholder.supabase.co"
    supabase_service_role_key: str = "placeholder"

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
    processed_data_dir: str = "/data/processed"

    # Model versions
    gigapath_version: str = "v1.0"
    uni_version: str = "v2.0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()