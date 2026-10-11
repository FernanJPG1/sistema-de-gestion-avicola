# ============================================================================
# ARCHIVO: backend/app/db/queries.py
# ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
# Imagínate que este archivo son LAS MANOS Y EL LAPICERO DEL ZOOTECNISTA EN LA OFICINA.
#
# Cuando la conexión (`connection.py`) abre la base de datos central de la granja avícola,
# este archivo sabe exactamente cómo consultar catálogos, procesar lotes, calcular
# el Índice de Eficiencia Productiva (IEP), la Conversión Alimenticia (CA) y el % de Postura.
#
# 1. LECTURA DE CATÁLOGOS:
#    - Granjas y Galpones (con tipo de ventilación y capacidad máxima de aves).
#    - Líneas Genéticas (Cobb 500, Ross 308, Lohmann Brown, Hy-Line Brown).
#    - Lotes activos con control de vacío sanitario (14 días reglamentarios ICA).
#    - Lista oficial de operarios y galponeros con sus cédulas.
#
# 2. ESCRITURA Y SINCRONIZACIÓN DE CAMPO:
#    - Inserción masiva de registros diarios (mortalidad, alimento, agua, clima).
#    - Muestreos de pesaje biométrico.
#    - Recolección y clasificación de huevos comerciales por calibres.
# ============================================================================

import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

def obtener_resumen_granjas(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """Devuelve el listado de granjas con conteo de galpones y aves activas."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT g.id, g.nombre, g.codigo, g.municipio, g.departamento,
               COUNT(DISTINCT gal.id) as total_galpones,
               COALESCE(SUM(l.aves_iniciales), 0) as total_aves_alojadas
        FROM tb_granjas g
        LEFT JOIN tb_galpones gal ON gal.granja_id = g.id
        LEFT JOIN tb_lotes l ON l.galpon_id = gal.id AND l.estado = 'ACTIVO'
        GROUP BY g.id
        ORDER BY g.nombre ASC
    """)
    return [dict(row) for row in cursor.fetchall()]

def obtener_lotes_con_metricas(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Obtiene todos los lotes activos con cálculo en tiempo real de:
    - Mortalidad acumulada (%)
    - Consumo acumulado de alimento (Kg)
    - Último pesaje y uniformidad
    - Conversión Alimenticia y IEP estimado
    """
    cursor = conn.cursor()
    cursor.execute("""
        SELECT l.*,
               g.nombre as nombre_galpon,
               gr.nombre as nombre_granja,
               lin.nombre as nombre_linea,
               COALESCE(SUM(r.mortalidad), 0) as mortalidad_acumulada,
               COALESCE(SUM(r.alimento_kg), 0) as alimento_acumulado_kg,
               COALESCE(SUM(r.agua_litros), 0) as agua_acumulada_litros,
               MAX(p.peso_promedio_g) as ultimo_peso_g,
               MAX(p.uniformidad_pct) as ultima_uniformidad_pct
        FROM tb_lotes l
        JOIN tb_galpones g ON l.galpon_id = g.id
        JOIN tb_granjas gr ON g.granja_id = gr.id
        JOIN tb_lineas_geneticas lin ON l.linea_id = lin.id
        LEFT JOIN tb_registros_diarios r ON r.lote_id = l.id
        LEFT JOIN tb_pesajes p ON p.lote_id = l.id
        GROUP BY l.id
        ORDER BY l.id DESC
    """)
    filas = [dict(row) for row in cursor.fetchall()]

    for f in filas:
        aves_ini = f.get('aves_iniciales', 1) or 1
        mort_acum = f.get('mortalidad_acumulada', 0)
        aves_vivas = max(0, aves_ini - mort_acum)
        f['aves_actuales_estimadas'] = aves_vivas
        f['mortalidad_pct'] = round((mort_acum / aves_ini) * 100, 2)

        # Cálculo de Conversión Alimenticia
        ult_peso_kg = (f.get('ultimo_peso_g') or 0) / 1000.0
        alimento_kg = f.get('alimento_acumulado_kg', 0)
        biomasa_kg = aves_vivas * ult_peso_kg

        if biomasa_kg > 0 and alimento_kg > 0:
            ca = round(alimento_kg / biomasa_kg, 3)
            f['conversion_alimenticia'] = ca
        else:
            f['conversion_alimenticia'] = None

    return filas

def ranking_rendimiento_galpones(conn: sqlite3.Connection) -> List[Dict[str, Any]]:
    """
    Calcula el podio de eficiencia zootécnica (Oro, Plata, Bronce)
    basado en el Índice de Eficiencia Productiva (IEP) para pollos de engorde
    y % de Postura promedio para gallinas ponedoras.
    """
    cursor = conn.cursor()
    cursor.execute("""
        SELECT l.id as lote_id,
               l.codigo_lote,
               l.tipo_ave,
               g.nombre as galpon,
               gr.nombre as granja,
               op.nombre_completo as operario_responsable,
               l.aves_iniciales,
               COALESCE(SUM(r.mortalidad), 0) as total_mortalidad,
               COALESCE(SUM(r.alimento_kg), 0) as total_alimento_kg,
               MAX(r.dia_vida) as dias_vida_max,
               MAX(p.peso_promedio_g) as peso_promedio_g,
               AVG(post.postura_pct) as postura_media_pct
        FROM tb_lotes l
        JOIN tb_galpones g ON l.galpon_id = g.id
        JOIN tb_granjas gr ON g.granja_id = gr.id
        LEFT JOIN tb_operarios op ON l.id = op.id
        LEFT JOIN tb_registros_diarios r ON r.lote_id = l.id
        LEFT JOIN tb_pesajes p ON p.lote_id = l.id
        LEFT JOIN tb_postura post ON post.lote_id = l.id
        WHERE l.estado = 'ACTIVO'
        GROUP BY l.id
    """)
    filas = [dict(row) for row in cursor.fetchall()]

    ranking = []
    for f in filas:
        aves_ini = f.get('aves_iniciales', 1) or 1
        mort = f.get('total_mortalidad', 0)
        viabilidad_pct = max(0.0, round(((aves_ini - mort) / aves_ini) * 100, 2))
        peso_kg = (f.get('peso_promedio_g') or 1800) / 1000.0
        alimento_kg = f.get('total_alimento_kg', 0)
        biomasa = (aves_ini - mort) * peso_kg
        edad = f.get('dias_vida_max') or 35

        ca = round(alimento_kg / biomasa, 3) if biomasa > 0 and alimento_kg > 0 else 1.55
        iep = round((viabilidad_pct * peso_kg * 100) / (edad * ca), 1) if (edad * ca) > 0 else 320.0

        ranking.append({
            "lote_id": f["lote_id"],
            "codigo_lote": f["codigo_lote"],
            "tipo_ave": f["tipo_ave"],
            "galpon": f["galpon"],
            "granja": f["granja"],
            "operario": f.get("operario_responsable") or "Galponero Asignado",
            "viabilidad_pct": viabilidad_pct,
            "peso_promedio_g": f.get("peso_promedio_g") or 0,
            "conversion_alimenticia": ca,
            "iep": iep,
            "postura_pct": round(f.get("postura_media_pct") or 0.0, 2)
        })

    # Ordenar por IEP si es engorde, o postura si es ponedora
    ranking.sort(key=lambda x: (x["iep"], x["postura_pct"]), reverse=True)
    return ranking
