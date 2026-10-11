from fastapi import APIRouter
from pathlib import Path
from app.core.config import settings
import os

router = APIRouter()

@router.get("/health")
def health_check():
    db_file = Path(settings.DB_PATH)
    exists = db_file.exists()
    size_mb = round(db_file.stat().st_size / (1024 * 1024), 2) if exists else 0.0

    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "path": settings.DB_PATH,
            "connected": exists,
            "size_mb": size_mb,
            "mode": "SQLite WAL High-Concurrency"
        }
    }
