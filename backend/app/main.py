# ============================================================================
# ARCHIVO: backend/app/main.py
# ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
# Imagínate que este archivo es EL COMPUTADOR CENTRAL O LA OFICINA PRINCIPAL DE LA GRANJA.
#
# Este programa se queda encendido todo el día en el servidor o computador de la granja,
# escuchando atentamente a través de la red local Wi-Fi y celular.
#
# ¿QUÉ HACE ESTE COMPUTADOR CENTRAL?
# 1. Atiende a las tabletas y celulares de campo: Cuando un operario o veterinario
#    ingresa datos, este programa los procesa de forma segura.
# 2. Abre y custodia la base de datos oficial (SQLite WAL): Guarda todos los lotes,
#    pesajes biométricos, curvas zootécnicas, mortalidad y costos de absorción.
# 3. Hace copias de seguridad de respaldo (Backups automáticos): Cada vez que un
#    dispositivo sincroniza, resguarda una copia para evitar pérdidas.
# 4. Entrega catálogos y recibe los registros tomados offline en los galpones.
# ============================================================================

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router
from app.api.endpoints import health
import logging
import os
from pathlib import Path

# Libro de anotaciones del servidor (guarda la bitácora de todo lo que pasa)
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(
    filename=f"{log_dir}/server.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# Creación de la aplicación servidora (FastAPI)
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuración de CORS para permitir conexiones desde la Web PWA y Flutter
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para Logging de Auditoría
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Petición avícola recibida: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Respuesta enviada: {response.status_code}")
    return response

@app.on_event("startup")
def startup_event():
    from app.db.connection import ensure_database_schema, safe_backup_database
    logger.info("Iniciando backend de SIGA Enterprise (Gestión Avícola)...")
    logger.info(f"Ruta de base de datos configurada: {settings.DB_PATH}")
    try:
        ensure_database_schema()
        safe_backup_database()
        logger.info("✓ Conexión a base de datos y esquemas avícolas verificados exitosamente.")
    except Exception as e:
        logger.error(f"⚠️ Advertencia al verificar base de datos en el inicio: {e}")

# Rutas del API
app.include_router(health.router, tags=["Health"])
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", include_in_schema=False)
def root(request: Request):
    db_file = Path(settings.DB_PATH)
    return {
        "message": f"Bienvenido a {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "database_path": settings.DB_PATH,
        "database_found": db_file.exists(),
        "database_size_mb": round(db_file.stat().st_size / (1024 * 1024), 2) if db_file.exists() else 0.0,
        "mode": "Local-First Enterprise Agro-Tech (Servidor Local Seguro)",
        "docs_url": "/docs",
        "endpoints": {
            "health": "/health",
            "granjas": f"{settings.API_V1_STR}/granjas",
            "lotes": f"{settings.API_V1_STR}/lotes",
            "registros": f"{settings.API_V1_STR}/registros",
            "sync": f"{settings.API_V1_STR}/sync"
        }
    }
