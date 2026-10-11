from fastapi import APIRouter
from app.api.endpoints import granjas, lotes, registros, sync

api_router = APIRouter()

api_router.include_router(granjas.router, prefix="/granjas", tags=["Granjas & Galpones"])
api_router.include_router(lotes.router, prefix="/lotes", tags=["Lotes de Producción"])
api_router.include_router(registros.router, prefix="/registros", tags=["Registros de Campo"])
api_router.include_router(sync.router, prefix="/sync", tags=["Sincronización Offline-First"])
