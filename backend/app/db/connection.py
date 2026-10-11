# ============================================================================
# ARCHIVO: backend/app/db/connection.py
# ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
# Es la caja fuerte y la memoria central de toda la granja avícola.
#
# Aquí se crea y gestiona la base de datos SQLite donde se guardan:
# 1. Los galpones y granjas.
# 2. Los lotes de pollos de engorde (Cobb 500 / Ross 308) y gallinas ponedoras (Lohmann Brown / Hy-Line).
# 3. Los pesajes biométricos, mortalidad diaria, consumo de agua y bultos de alimento.
# 4. Los registros de postura y clasificación de huevos (AAA, AA, A, B).
# 5. La cola de sincronización para celulares y computadores sin internet (Offline-First).
# ============================================================================

import sqlite3
import shutil
import os
from datetime import datetime
from app.core.config import settings

def get_db():
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def get_connection():
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def safe_backup_database():
    """Realiza una copia de seguridad rotativa de la base de datos empresarial"""
    if not os.path.exists(settings.DB_PATH):
        return
    os.makedirs(settings.BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(settings.BACKUP_DIR, f"siga_backup_{timestamp}.db")
    try:
        shutil.copy2(settings.DB_PATH, backup_path)
    except Exception as e:
        print(f"Error generando copia de respaldo: {e}")

def ensure_database_schema():
    """Crea las tablas del sistema e inserta semillas si está vacía"""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tb_granjas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        registro_ica TEXT NOT NULL,
        municipio TEXT NOT NULL,
        departamento TEXT NOT NULL,
        capacidad_total INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tb_galpones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        granja_id INTEGER NOT NULL,
        numero TEXT NOT NULL,
        tipo_sistema TEXT NOT NULL, -- Tunel, Abierto, Automatizado
        area_m2 REAL NOT NULL,
        capacidad_maxima INTEGER NOT NULL,
        FOREIGN KEY (granja_id) REFERENCES tb_granjas(id)
    );

    CREATE TABLE IF NOT EXISTS tb_operarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cedula TEXT UNIQUE NOT NULL,
        nombre_completo TEXT NOT NULL,
        cargo TEXT NOT NULL, -- Galponero, Veterinario, Supervisor
        activo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tb_lotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        codigo TEXT UNIQUE NOT NULL,
        galpon_id INTEGER NOT NULL,
        tipo_ave TEXT NOT NULL, -- 'ENGORDE' o 'PONEDORA'
        linea_genetica TEXT NOT NULL, -- Cobb 500, Ross 308, Lohmann Brown
        fecha_ingreso TEXT NOT NULL,
        edad_dias_inicial INTEGER NOT NULL DEFAULT 1,
        cantidad_inicial INTEGER NOT NULL,
        cantidad_actual INTEGER NOT NULL,
        peso_inicial_g REAL NOT NULL DEFAULT 42.0,
        estado TEXT NOT NULL DEFAULT 'ACTIVO', -- 'ACTIVO', 'FINALIZADO'
        fecha_cierre TEXT,
        sincronizado INTEGER DEFAULT 1,
        FOREIGN KEY (galpon_id) REFERENCES tb_galpones(id)
    );

    CREATE TABLE IF NOT EXISTS tb_registros_diarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        lote_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        dia_vida INTEGER NOT NULL,
        mortalidad INTEGER NOT NULL DEFAULT 0,
        descarte INTEGER NOT NULL DEFAULT 0,
        alimento_kg REAL NOT NULL DEFAULT 0.0,
        agua_litros REAL NOT NULL DEFAULT 0.0,
        temp_min REAL,
        temp_max REAL,
        humedad_pct REAL,
        observaciones TEXT,
        operario_id INTEGER,
        created_at TEXT NOT NULL,
        sincronizado INTEGER DEFAULT 1,
        FOREIGN KEY (lote_id) REFERENCES tb_lotes(id)
    );

    CREATE TABLE IF NOT EXISTS tb_pesajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        lote_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        dia_vida INTEGER NOT NULL,
        aves_pesadas INTEGER NOT NULL,
        peso_promedio_g REAL NOT NULL,
        uniformidad_pct REAL NOT NULL,
        cv_pct REAL NOT NULL,
        peso_estandar_g REAL NOT NULL,
        observaciones TEXT,
        created_at TEXT NOT NULL,
        sincronizado INTEGER DEFAULT 1,
        FOREIGN KEY (lote_id) REFERENCES tb_lotes(id)
    );

    CREATE TABLE IF NOT EXISTS tb_postura (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        lote_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        huevos_totales INTEGER NOT NULL,
        huevos_comerciales INTEGER NOT NULL,
        huevos_rotos INTEGER NOT NULL DEFAULT 0,
        huevos_sucios INTEGER NOT NULL DEFAULT 0,
        calibre_jumbo INTEGER DEFAULT 0,
        calibre_aaa INTEGER DEFAULT 0,
        calibre_aa INTEGER DEFAULT 0,
        calibre_a INTEGER DEFAULT 0,
        calibre_b INTEGER DEFAULT 0,
        postura_pct REAL,
        created_at TEXT NOT NULL,
        sincronizado INTEGER DEFAULT 1,
        FOREIGN KEY (lote_id) REFERENCES tb_lotes(id)
    );

    CREATE TABLE IF NOT EXISTS tb_eliminaciones_pendientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        tabla TEXT NOT NULL,
        fecha_eliminacion TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tb_sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dispositivo_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        registros_recibidos INTEGER NOT NULL,
        detalles TEXT
    );
    """)

    # Verificar si necesitamos sembrar datos de ejemplo iniciales
    cursor.execute("SELECT COUNT(*) FROM tb_granjas")
    if cursor.fetchone()[0] == 0:
        _insert_seed_data(cursor)

    conn.commit()
    conn.close()

def _insert_seed_data(cursor):
    """Inserta datos iniciales de la operación avícola"""
    cursor.execute("""
    INSERT INTO tb_granjas (codigo, nombre, registro_ica, municipio, departamento, capacidad_total)
    VALUES ('GRA-01', 'Granja El Paraíso', 'ICA-GAB-004821', 'Fusagasugá', 'Cundinamarca', 85000);
    """)
    granja_id = cursor.lastrowid

    galpones = [
        (granja_id, 'Galpón 1 (Túnel)', 'Túnel Dinámico', 1200.0, 22000),
        (granja_id, 'Galpón 2 (Túnel)', 'Túnel Dinámico', 1200.0, 22000),
        (granja_id, 'Galpón 3 (Automatizado)', 'Jaula Aviario', 1500.0, 25000),
        (granja_id, 'Galpón 4 (Ponedoras)', 'Piso / Nidal', 1000.0, 16000),
    ]
    cursor.executemany("""
    INSERT INTO tb_galpones (granja_id, numero, tipo_sistema, area_m2, capacidad_maxima)
    VALUES (?, ?, ?, ?, ?);
    """, galpones)

    operarios = [
        ('1014285941', 'Carlos Rodríguez', 'Supervisor de Granja'),
        ('1023948572', 'María Consuelo Pérez', 'Galponera Especialista'),
        ('80192847', 'Dr. Jorge Hernán Mora', 'Médico Veterinario ICA'),
    ]
    cursor.executemany("""
    INSERT INTO tb_operarios (cedula, nombre_completo, cargo)
    VALUES (?, ?, ?);
    """, operarios)

    lotes = [
        ('uuid-lote-engorde-01', 'LOTE-ENG-2026-04', 1, 'ENGORDE', 'Cobb 500', '2026-03-01', 1, 20000, 19480, 42.0, 'ACTIVO', None, 1),
        ('uuid-lote-engorde-02', 'LOTE-ENG-2026-05', 2, 'ENGORDE', 'Ross 308 AP', '2026-03-15', 1, 22000, 21740, 41.5, 'ACTIVO', None, 1),
        ('uuid-lote-ponedora-01', 'LOTE-PON-2025-11', 3, 'PONEDORA', 'Lohmann Brown-Classic', '2025-10-10', 1, 24000, 23510, 38.0, 'ACTIVO', None, 1),
        ('uuid-lote-ponedora-02', 'LOTE-PON-2026-01', 4, 'PONEDORA', 'Hy-Line Brown', '2026-01-05', 1, 15000, 14790, 39.0, 'ACTIVO', None, 1),
    ]
    cursor.executemany("""
    INSERT INTO tb_lotes (uuid, codigo, galpon_id, tipo_ave, linea_genetica, fecha_ingreso, edad_dias_inicial, cantidad_inicial, cantidad_actual, peso_inicial_g, estado, fecha_cierre, sincronizado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, lotes)
