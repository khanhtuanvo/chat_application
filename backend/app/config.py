from pydantic_settings import BaseSettings
import os
import secrets

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:Khanh2006*@localhost:5432/user_management")
    secret_key: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    algorithm: str = "HS256"
    
    # CORS settings
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    
    # Database settings
    database_echo: bool = os.getenv("DATABASE_ECHO", "False").lower() == "true"
    
    # OpenAI settings
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = '.env'
        case_sensitive = False
        extra = "allow"  # Allow extra fields from environment variables

settings = Settings()