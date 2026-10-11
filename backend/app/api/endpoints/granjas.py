from fastapi import APIRouter, Depends
from typing import List
import sqlite3
from app.db.connection import get_db
from app.models.schemas import GranjaResponse, GalponResponse, OperarioResponse

router = APIRouter()

@router.get("/", response_model=List[GranjaResponse])
def get_granjas(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tb_granjas ORDER BY nombre ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.get("/galpones", response_model=List[GalponResponse])
def get_galpones(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tb_galpones ORDER BY id ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

@router.get("/operarios", response_model=List[OperarioResponse])
def get_operarios(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM tb_operarios WHERE activo = 1 ORDER BY nombre_completo ASC")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]
