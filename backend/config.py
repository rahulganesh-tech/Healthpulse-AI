import os

class Settings:
    APP_NAME: str = "HealthPulse AI"
    ENV: str = os.getenv("ENV", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./healthpulse.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "healthpulse-super-secret-jwt-key-2026-seva")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    OTP_DEMO_CODE: str = os.getenv("OTP_DEMO_CODE", "482913")
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://healthpulse-ai.vercel.app"
    ]
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "none")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")

settings = Settings()
