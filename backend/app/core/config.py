import os

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        PROJECT_NAME: str = "SIGA Enterprise - Sistema Integrado de Gestión Avícola"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        DB_PATH: str = os.getenv("SIGA_DB_PATH", "siga_database.db")
        BACKUP_DIR: str = "backups"
        API_KEY: str = os.getenv("SIGA_API_KEY", "siga-secret-key-2026")

        class Config:
            case_sensitive = True

    settings = Settings()
except ImportError:
    # Respaldo nativo si pydantic_settings aún no está instalado en el entorno
    class Settings:
        PROJECT_NAME: str = "SIGA Enterprise - Sistema Integrado de Gestión Avícola"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        DB_PATH: str = os.getenv("SIGA_DB_PATH", "siga_database.db")
        BACKUP_DIR: str = "backups"
        API_KEY: str = os.getenv("SIGA_API_KEY", "siga-secret-key-2026")

    settings = Settings()
