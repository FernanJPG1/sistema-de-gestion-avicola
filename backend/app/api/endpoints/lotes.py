from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import sqlite3
from datetime import datetime
from app.db.connection import get_db
from app.models.schemas import LoteResponse, LoteBase

router = APIRouter()

@router.get("/", response_model=List[LoteResponse])
def get_lotes(estado: Optional[str] = None, tipo_ave: Optional[str] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    query = "SELECT * FROM tb_lotes WHERE 1=1"
    params = []
    if estado:
        query += " AND estado = ?"
        params.append(estado)
    if tipo_ave:
        query += " AND tipo_ave = ?"
        params.append(tipo_ave)
    query += " ORDER BY id DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.post("/", response_model=LoteResponse)
def create_lote(lote: LoteBase, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("""
        INSERT INTO tb_lotes (uuid, codigo, galpon_id, tipo_ave, linea_genetica, fecha_ingreso, edad_dias_inicial, cantidad_inicial, cantidad_actual, peso_inicial_g, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (lote.uuid, lote.codigo, lote.galpon_id, lote.tipo_ave, lote.linea_genetica, lote.fecha_ingreso, lote.edad_dias_inicial, lote.cantidad_inicial, lote.cantidad_actual, lote.peso_inicial_g, lote.estado))
        db.commit()
        lote_id = cursor.lastrowid
        cursor.execute("SELECT * FROM tb_lotes WHERE id = ?", (lote_id,))
        return dict(cursor.fetchone())
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"Error creando lote o código duplicado: {e}")

@router.put("/{uuid}/finalizar")
def finalizar_lote(uuid: str, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, estado FROM tb_lotes WHERE uuid = ?", (uuid,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    
    fecha_fin = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("UPDATE tb_lotes SET estado = 'FINALIZADO', fecha_cierre = ? WHERE uuid = ?", (fecha_fin, uuid))
    db.commit()
    return {"message": "Ciclo de lote finalizado con éxito", "fecha_cierre": fecha_fin}
