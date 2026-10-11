from pydantic import BaseModel, Field
from typing import List, Optional

class GranjaResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    registro_ica: str
    municipio: str
    departamento: str
    capacidad_total: int

class GalponResponse(BaseModel):
    id: int
    granja_id: int
    numero: str
    tipo_sistema: str
    area_m2: float
    capacidad_maxima: int

class OperarioResponse(BaseModel):
    id: int
    cedula: str
    nombre_completo: str
    cargo: str
    activo: int

class LoteBase(BaseModel):
    uuid: str
    codigo: str
    galpon_id: int
    tipo_ave: str
    linea_genetica: str
    fecha_ingreso: str
    edad_dias_inicial: int = 1
    cantidad_inicial: int
    cantidad_actual: int
    peso_inicial_g: float = 42.0
    estado: str = "ACTIVO"
    fecha_cierre: Optional[str] = None

class LoteResponse(LoteBase):
    id: int
    sincronizado: int = 1

class RegistroDiarioBase(BaseModel):
    uuid: str
    lote_id: int
    fecha: str
    dia_vida: int
    mortalidad: int = 0
    descarte: int = 0
    alimento_kg: float = 0.0
    agua_litros: float = 0.0
    temp_min: Optional[float] = None
    temp_max: Optional[float] = None
    humedad_pct: Optional[float] = None
    observaciones: Optional[str] = None
    operario_id: Optional[int] = None
    created_at: str

class RegistroDiarioResponse(RegistroDiarioBase):
    id: int
    sincronizado: int = 1

class PesajeBase(BaseModel):
    uuid: str
    lote_id: int
    fecha: str
    dia_vida: int
    aves_pesadas: int
    peso_promedio_g: float
    uniformidad_pct: float
    cv_pct: float
    peso_estandar_g: float
    observaciones: Optional[str] = None
    created_at: str

class PesajeResponse(PesajeBase):
    id: int
    sincronizado: int = 1

class PosturaBase(BaseModel):
    uuid: str
    lote_id: int
    fecha: str
    huevos_totales: int
    huevos_comerciales: int
    huevos_rotos: int = 0
    huevos_sucios: int = 0
    calibre_jumbo: int = 0
    calibre_aaa: int = 0
    calibre_aa: int = 0
    calibre_a: int = 0
    calibre_b: int = 0
    postura_pct: Optional[float] = None
    created_at: str

class PosturaResponse(PosturaBase):
    id: int
    sincronizado: int = 1

# Payload para Sincronización Bidireccional Local-First
class SyncPayload(BaseModel):
    dispositivo_id: str
    timestamp: str
    registros_diarios: List[RegistroDiarioBase] = []
    pesajes: List[PesajeBase] = []
    posturas: List[PosturaBase] = []
    eliminaciones: List[dict] = [] # {"uuid": "...", "tabla": "..."}

class SyncResponse(BaseModel):
    success: bool
    message: str
    server_time: str
    recibidos: int
    lotes_actuales: List[LoteResponse]
