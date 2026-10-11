// ============================================================================
// ARCHIVO: app_movil/lib/database/local_db.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es LA CAJA FUERTE INTERNA DEL CELULAR (Base de datos SQLite local).
//
// Permite que la app funcione 100% desconectada de internet en medio de los galpones.
// Aunque el teléfono no tenga señal ni Wi-Fi, todo se anota al instante.
//
// Mantiene:
// 1. Los lotes de engorde y ponedoras asignados a cada galpón.
// 2. La tabla de registros diarios (mortalidad, bultos de comida, agua).
// 3. Los pesajes semanales y la producción de huevos clasificados.
// 4. El "CHECKPOINT": Al terminar el día o suspenderse la app, sella todo en disco.
// ============================================================================

import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._init();
  static Database? _database;

  LocalDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('siga_movil_local.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await db.execute('PRAGMA journal_mode = WAL;');

    // 1. Granjas
    await db.execute('''
      CREATE TABLE tb_granjas (
        id INTEGER PRIMARY KEY,
        codigo TEXT NOT NULL,
        nombre TEXT NOT NULL,
        registro_ica TEXT NOT NULL
      )
    ''');

    // 2. Galpones
    await db.execute('''
      CREATE TABLE tb_galpones (
        id INTEGER PRIMARY KEY,
        granja_id INTEGER NOT NULL,
        numero TEXT NOT NULL,
        tipo_sistema TEXT NOT NULL,
        capacidad_maxima INTEGER NOT NULL
      )
    ''');

    // 3. Lotes
    await db.execute('''
      CREATE TABLE tb_lotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        codigo TEXT NOT NULL,
        galpon_id INTEGER NOT NULL,
        tipo_ave TEXT NOT NULL,
        linea_genetica TEXT NOT NULL,
        fecha_ingreso TEXT NOT NULL,
        cantidad_inicial INTEGER NOT NULL,
        cantidad_actual INTEGER NOT NULL,
        peso_inicial_g REAL NOT NULL,
        estado TEXT NOT NULL DEFAULT 'ACTIVO',
        sincronizado INTEGER NOT NULL DEFAULT 1
      )
    ''');

    // 4. Registros Diarios
    await db.execute('''
      CREATE TABLE tb_registros_diarios (
        id_local INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        lote_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        dia_vida INTEGER NOT NULL,
        mortalidad INTEGER NOT NULL DEFAULT 0,
        alimento_kg REAL NOT NULL DEFAULT 0,
        agua_litros REAL NOT NULL DEFAULT 0,
        temp_min REAL,
        temp_max REAL,
        humedad_pct REAL,
        observaciones TEXT,
        sincronizado INTEGER NOT NULL DEFAULT 0
      )
    ''');

    // 5. Pesajes
    await db.execute('''
      CREATE TABLE tb_pesajes (
        id_local INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        lote_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        dia_vida INTEGER NOT NULL,
        aves_pesadas INTEGER NOT NULL,
        peso_promedio_g REAL NOT NULL,
        uniformidad_pct REAL NOT NULL,
        cv_pct REAL NOT NULL,
        sincronizado INTEGER NOT NULL DEFAULT 0
      )
    ''');

    // 6. Postura de Huevos
    await db.execute('''
      CREATE TABLE tb_postura (
        id_local INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        lote_id INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        huevos_totales INTEGER NOT NULL,
        huevos_comerciales INTEGER NOT NULL,
        huevos_rotos INTEGER NOT NULL DEFAULT 0,
        calibre_aaa INTEGER DEFAULT 0,
        calibre_aa INTEGER DEFAULT 0,
        calibre_a INTEGER DEFAULT 0,
        sincronizado INTEGER NOT NULL DEFAULT 0
      )
    ''');

    // 7. Eliminaciones Pendientes para Sincronizar
    await db.execute('''
      CREATE TABLE tb_eliminaciones_pendientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        tabla TEXT NOT NULL,
        fecha_eliminacion TEXT NOT NULL
      )
    ''');

    // Semillas iniciales
    await _insertInitialSeeds(db);
  }

  Future<void> _insertInitialSeeds(Database db) async {
    final batch = db.batch();

    batch.insert('tb_granjas', {
      'id': 1,
      'codigo': 'GRA-01',
      'nombre': 'Granja El Paraíso',
      'registro_ica': 'ICA-GAB-004821',
    });

    batch.insert('tb_galpones', {
      'id': 1,
      'granja_id': 1,
      'numero': 'Galpón 1 (Túnel)',
      'tipo_sistema': 'Túnel Dinámico',
      'capacidad_maxima': 22000,
    });
    batch.insert('tb_galpones', {
      'id': 2,
      'granja_id': 1,
      'numero': 'Galpón 2 (Túnel)',
      'tipo_sistema': 'Túnel Dinámico',
      'capacidad_maxima': 22000,
    });
    batch.insert('tb_galpones', {
      'id': 3,
      'granja_id': 1,
      'numero': 'Galpón 3 (Aviario)',
      'tipo_sistema': 'Jaula Vertical',
      'capacidad_maxima': 25000,
    });

    batch.insert('tb_lotes', {
      'uuid': 'uuid-eng-01',
      'codigo': 'LOTE-ENG-2026-04',
      'galpon_id': 1,
      'tipo_ave': 'ENGORDE',
      'linea_genetica': 'Cobb 500',
      'fecha_ingreso': '2026-03-01',
      'cantidad_inicial': 20000,
      'cantidad_actual': 19480,
      'peso_inicial_g': 42.0,
      'estado': 'ACTIVO',
      'sincronizado': 1,
    });
    batch.insert('tb_lotes', {
      'uuid': 'uuid-eng-02',
      'codigo': 'LOTE-ENG-2026-05',
      'galpon_id': 2,
      'tipo_ave': 'ENGORDE',
      'linea_genetica': 'Ross 308 AP',
      'fecha_ingreso': '2026-03-15',
      'cantidad_inicial': 22000,
      'cantidad_actual': 21740,
      'peso_inicial_g': 41.5,
      'estado': 'ACTIVO',
      'sincronizado': 1,
    });
    batch.insert('tb_lotes', {
      'uuid': 'uuid-pon-01',
      'codigo': 'LOTE-PON-2025-11',
      'galpon_id': 3,
      'tipo_ave': 'PONEDORA',
      'linea_genetica': 'Lohmann Brown-Classic',
      'fecha_ingreso': '2025-10-10',
      'cantidad_inicial': 24000,
      'cantidad_actual': 23510,
      'peso_inicial_g': 38.0,
      'estado': 'ACTIVO',
      'sincronizado': 1,
    });

    await batch.commit(noResult: true);
  }

  /// CHECKPOINT: Asegura la persistencia en disco duro ante cierres repentinos
  Future<void> checkpoint() async {
    try {
      final db = await database;
      await db.rawQuery('PRAGMA wal_checkpoint(FULL)');
    } catch (_) {}
  }

  Future close() async {
    final db = await instance.database;
    db.close();
  }
}
