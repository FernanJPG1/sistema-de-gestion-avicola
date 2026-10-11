# ============================================================================
# ARCHIVO: backend/app/api/endpoints/sync.py
# ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
# Es el puente aéreo y el muelle de carga entre los celulares y el computador central.
#
# Cuando un galponero regresa del campo y el celular agarra Wi-Fi:
# 1. Este archivo recibe el paquete con todos los datos que el galponero anotó sin internet.
# 2. Revisa registro por registro para no duplicar nada (gracias al código UUID único).
# 3. Borra lo que el usuario haya descartado en campo dentro de las 48 horas.
# 4. Le devuelve al celular los lotes actualizados y le confirma: "¡Todo recibido y guardado con éxito!"
# ============================================================================

from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from datetime import datetime
from app.db.connection import get_db, safe_backup_database
from app.models.schemas import SyncPayload, SyncResponse, LoteResponse

router = APIRouter()

@router.post("/", response_model=SyncResponse)
def sincronizar_dispositivo(payload: SyncPayload, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    safe_backup_database()

    total_recibidos = 0

    try:
        # 1. Procesar Registros Diarios
        for reg in payload.registros_diarios:
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
                reg.uuid, reg.lote_id, reg.fecha, reg.dia_vida,
                reg.mortalidad, reg.descarte, reg.alimento_kg, reg.agua_litros,
                reg.temp_min, reg.temp_max, reg.humedad_pct,
                reg.observaciones, reg.operario_id, reg.created_at
            ))
            total_recibidos += 1

        # 2. Procesar Pesajes
        for p in payload.pesajes:
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
                p.uuid, p.lote_id, p.fecha, p.dia_vida,
                p.aves_pesadas, p.peso_promedio_g, p.uniformidad_pct,
                p.cv_pct, p.peso_estandar_g, p.observaciones, p.created_at
            ))
            total_recibidos += 1

        # 3. Procesar Posturas
        for post in payload.posturas:
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
                post.uuid, post.lote_id, post.fecha, post.huevos_totales,
                post.huevos_comerciales, post.huevos_rotos, post.huevos_sucios,
                post.calibre_jumbo, post.calibre_aaa, post.calibre_aa,
                post.calibre_a, post.calibre_b, post.postura_pct, post.created_at
            ))
            total_recibidos += 1

        # 4. Procesar Eliminaciones Remotas
        for el in payload.eliminaciones:
            uuid_to_del = el.get("uuid")
            tabla = el.get("tabla", "tb_registros_diarios")
            if uuid_to_del and tabla in ["tb_registros_diarios", "tb_pesajes", "tb_postura"]:
                cursor.execute(f"DELETE FROM {tabla} WHERE uuid = ?", (uuid_to_del,))

        # 5. Guardar bitácora de sincronización
        server_now = datetime.now().isoformat()
        cursor.execute("""
        INSERT INTO tb_sync_log (dispositivo_id, timestamp, registros_recibidos, detalles)
        VALUES (?, ?, ?, ?);
        """, (payload.dispositivo_id, server_now, total_recibidos, f"Sincronizados {total_recibidos} registros desde {payload.dispositivo_id}"))

        db.commit()

        # 6. Consultar lotes vigentes para devolver al dispositivo
        cursor.execute("SELECT * FROM tb_lotes ORDER BY id DESC")
        lotes_rows = cursor.fetchall()
        lotes_actuales = [LoteResponse(**dict(row)) for row in lotes_rows]

        return SyncResponse(
            success=True,
            message=f"Sincronización exitosa. {total_recibidos} registros procesados e integrados.",
            server_time=server_now,
            recibidos=total_recibidos,
            lotes_actuales=lotes_actuales
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fallo durante la sincronización transaccional: {str(e)}")
