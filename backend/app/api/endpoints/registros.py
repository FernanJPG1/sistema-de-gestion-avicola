from fastapi import APIRouter, Depends, HTTPException
from typing import List
import sqlite3
from datetime import datetime, timedelta
from app.db.connection import get_db
from app.models.schemas import (
    RegistroDiarioBase, RegistroDiarioResponse,
    PesajeBase, PesajeResponse,
    PosturaBase, PosturaResponse
)

router = APIRouter()

def puede_modificar_por_fecha(fecha_str: str) -> bool:
    """Regla de Inmutabilidad de 48 Horas:
    Permite modificar registros durante 2 días calendario (48 horas).
    Pasado este plazo se bloquea para resguardar la trazabilidad oficial.
    """
    try:
        fecha_reg = datetime.strptime(fecha_str[:10], "%Y-%m-%d")
        dias_diferencia = (datetime.now() - fecha_reg).total_seconds() / 86400
        return dias_diferencia <= 2.0
    except Exception:
        return True

@router.get("/diarios", response_model=List[RegistroDiarioResponse])
def get_registros_diarios(lote_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tb_registros_diarios WHERE lote_id = ? ORDER BY fecha DESC", (lote_id,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/diarios", response_model=RegistroDiarioResponse)
def create_registro_diario(registro: RegistroDiarioBase, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO tb_registros_diarios (
        uuid, lote_id, fecha, dia_vida, mortalidad, descarte, alimento_kg, agua_litros,
        temp_min, temp_max, humedad_pct, observaciones, operario_id, created_at, sincronizado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(uuid) DO UPDATE SET
        mortalidad = excluded.mortalidad,
        descarte = excluded.descarte,
        alimento_kg = excluded.alimento_kg,
        agua_litros = excluded.agua_litros,
        temp_min = excluded.temp_min,
        temp_max = excluded.temp_max,
        humedad_pct = excluded.humedad_pct,
        observaciones = excluded.observaciones;
    """, (
        registro.uuid, registro.lote_id, registro.fecha, registro.dia_vida,
        registro.mortalidad, registro.descarte, registro.alimento_kg, registro.agua_litros,
        registro.temp_min, registro.temp_max, registro.humedad_pct,
        registro.observaciones, registro.operario_id, registro.created_at
    ))
    # Actualizar cantidad actual en lote restando mortalidad
    cursor.execute("""
    UPDATE tb_lotes SET cantidad_actual = cantidad_actual - ?
    WHERE id = ? AND cantidad_actual >= ?;
    """, (registro.mortalidad + registro.descarte, registro.lote_id, registro.mortalidad + registro.descarte))
    
    db.commit()
    cursor.execute("SELECT * FROM tb_registros_diarios WHERE uuid = ?", (registro.uuid,))
    return dict(cursor.fetchone())

@router.delete("/diarios/{uuid}")
def delete_registro_diario(uuid: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT fecha FROM tb_registros_diarios WHERE uuid = ?", (uuid,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    if not puede_modificar_por_fecha(row["fecha"]):
        raise HTTPException(
            status_code=403,
            detail="Bloqueado por seguridad (> 48 horas). La modificación solo se permite en la Base de Datos Central."
        )

    cursor.execute("DELETE FROM tb_registros_diarios WHERE uuid = ?", (uuid,))
    db.commit()
    return {"message": "Registro eliminado con éxito"}

@router.get("/pesajes", response_model=List[PesajeResponse])
def get_pesajes(lote_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tb_pesajes WHERE lote_id = ? ORDER BY fecha DESC", (lote_id,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/pesajes", response_model=PesajeResponse)
def create_pesaje(pesaje: PesajeBase, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO tb_pesajes (
        uuid, lote_id, fecha, dia_vida, aves_pesadas, peso_promedio_g,
        uniformidad_pct, cv_pct, peso_estandar_g, observaciones, created_at, sincronizado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(uuid) DO UPDATE SET
        peso_promedio_g = excluded.peso_promedio_g,
        uniformidad_pct = excluded.uniformidad_pct,
        cv_pct = excluded.cv_pct;
    """, (
        pesaje.uuid, pesaje.lote_id, pesaje.fecha, pesaje.dia_vida,
        pesaje.aves_pesadas, pesaje.peso_promedio_g, pesaje.uniformidad_pct,
        pesaje.cv_pct, pesaje.peso_estandar_g, pesaje.observaciones, pesaje.created_at
    ))
    db.commit()
    cursor.execute("SELECT * FROM tb_pesajes WHERE uuid = ?", (pesaje.uuid,))
    return dict(cursor.fetchone())

@router.get("/postura", response_model=List[PosturaResponse])
def get_postura(lote_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tb_postura WHERE lote_id = ? ORDER BY fecha DESC", (lote_id,))
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/postura", response_model=PosturaResponse)
def create_postura(postura: PosturaBase, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO tb_postura (
        uuid, lote_id, fecha, huevos_totales, huevos_comerciales, huevos_rotos,
        huevos_sucios, calibre_jumbo, calibre_aaa, calibre_aa, calibre_a, calibre_b,
        postura_pct, created_at, sincronizado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(uuid) DO UPDATE SET
        huevos_totales = excluded.huevos_totales,
        huevos_comerciales = excluded.huevos_comerciales,
        postura_pct = excluded.postura_pct;
    """, (
        postura.uuid, postura.lote_id, postura.fecha, postura.huevos_totales,
        postura.huevos_comerciales, postura.huevos_rotos, postura.huevos_sucios,
        postura.calibre_jumbo, postura.calibre_aaa, postura.calibre_aa,
        postura.calibre_a, postura.calibre_b, postura.postura_pct, postura.created_at
    ))
    db.commit()
    cursor.execute("SELECT * FROM tb_postura WHERE uuid = ?", (postura.uuid,))
    return dict(cursor.fetchone())
