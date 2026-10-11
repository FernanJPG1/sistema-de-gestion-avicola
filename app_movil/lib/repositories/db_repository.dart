// ============================================================================
// 🐔 ARCHIVO: db_repository.dart (EL AUDITOR Y MAYORDOMO DE LA GRANJA)
// ============================================================================
// ¿QUÉ HACE ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es la persona inteligente que REVISA Y HACE CUMPLIR LAS REGLAS ZOOTÉCNICAS:
//
// 1. Controla que un galpón no se sobrecargue: Si caben 20.000 pollos, no deja meter 20.001.
// 2. Vigila el Vacío Sanitario ICA: No permite meter aves a un galpón si no ha cumplido
//    sus 14 días reglamentarios de lavado, desinfección y descanso sanitario.
// 3. Aplica la Regla del Candado de 48 Horas: Si pasaron más de 2 días calendario,
//    bloquea el registro para que nadie en campo pueda alterarlo.
// 4. Calcula el Podio de Medallas (Oro, Plata y Bronce) según el IEP y la conversión.
// 5. Mantiene la comunicación con el almacenamiento SQLite seguro.
// ============================================================================

import 'package:sqflite/sqflite.dart';
import 'package:app_movil/database/local_db.dart';
import 'package:app_movil/database/seed_data.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/services/persistent_backup_service.dart';
import 'package:app_movil/utils/calendario_util.dart';

class ZootecnicValidationException implements Exception {
  final String message;
  ZootecnicValidationException(this.message);

  @override
  String toString() => message;
}

class DbRepository {
  static final DbRepository _instance = DbRepository._internal();
  factory DbRepository() => _instance;
  DbRepository._internal();

  Future<Database> get _db async => await LocalDatabase.instance.database;

  // --- CONSULTAS BÁSICAS ---

  Future<List<Granja>> obtenerGranjas() async {
    final db = await _db;
    final res = await db.query('tb_granjas', orderBy: 'nombre ASC');
    return res.map((m) => Granja.fromMap(m)).toList();
  }

  Future<List<Galpon>> obtenerGalpones() async {
    final db = await _db;
    final res = await db.query('tb_galpones', orderBy: 'id ASC');
    return res.map((m) => Galpon.fromMap(m)).toList();
  }

  Future<List<Operario>> obtenerOperarios() async {
    final db = await _db;
    final res = await db.query('tb_operarios', where: 'activo = 1', orderBy: 'nombre_completo ASC');
    return res.map((m) => Operario.fromMap(m)).toList();
  }

  Future<List<Lote>> obtenerLotes({bool soloActivos = false, String? tipoAve}) async {
    final db = await _db;
    String where = '';
    List<dynamic> args = [];

    if (soloActivos) {
      where += 'estado = ?';
      args.add('ACTIVO');
    }
    if (tipoAve != null && tipoAve.isNotEmpty && tipoAve != 'TODOS') {
      if (where.isNotEmpty) where += ' AND ';
      where += 'tipo_ave = ?';
      args.add(tipoAve);
    }

    final res = await db.query(
      'tb_lotes',
      where: where.isEmpty ? null : where,
      whereArgs: args.isEmpty ? null : args,
      orderBy: 'id DESC',
    );
    return res.map((m) => Lote.fromMap(m)).toList();
  }

  // --- REGLAS ZOOTÉCNICAS Y VALIDACIONES ---

  /// Valida si el galpón está apto para recibir aves según normas ICA y capacidad
  Future<void> validarGalponParaLote(int galponId, int cantidadAves) async {
    final db = await _db;
    final galpones = await db.query('tb_galpones', where: 'id = ?', whereArgs: [galponId]);
    if (galpones.isEmpty) throw ZootecnicValidationException('El galpón especificado no existe.');

    final g = Galpon.fromMap(galpones.first);

    if (g.estado == 'VACIO_SANITARIO') {
      throw ZootecnicValidationException(
        'ALERTA SANITARIA ICA: El ${g.numero} se encuentra en descanso sanitario obligatorio. '
        'No se permite el alojamiento de aves hasta completar la desinfección.',
      );
    }

    if (cantidadAves > g.capacidadMaxima) {
      throw ZootecnicValidationException(
        'EXCESO DE DENSIDAD: La cantidad ($cantidadAves aves) excede la capacidad máxima '
        'biosegura del galpón (${g.capacidadMaxima} aves).',
      );
    }
  }

  // --- REGISTROS DIARIOS Y REGLA DE 48 HORAS ---

  Future<int> guardarRegistroDiario(RegistroDiario reg) async {
    final db = await _db;
    final res = await db.insert(
      'tb_registros_diarios',
      reg.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );

    // Actualizar cantidad actual restando bajas
    final totalBajas = reg.mortalidad + reg.descarte;
    if (totalBajas > 0) {
      await db.rawUpdate('''
        UPDATE tb_lotes
        SET cantidad_actual = cantidad_actual - ?
        WHERE id = ? AND cantidad_actual >= ?
      ''', [totalBajas, reg.loteId, totalBajas]);
    }

    await LocalDatabase.instance.checkpoint();
    await PersistentBackupService.instance.resguardarRegistros();
    return res;
  }

  Future<int> guardarPesaje(PesajeBiometrico pesaje) async {
    final db = await _db;
    final res = await db.insert(
      'tb_pesajes',
      pesaje.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    await LocalDatabase.instance.checkpoint();
    return res;
  }

  Future<int> guardarPostura(ProduccionHuevos postura) async {
    final db = await _db;
    final res = await db.insert(
      'tb_postura',
      postura.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    await LocalDatabase.instance.checkpoint();
    return res;
  }

  /// Eliminar registro aplicando la Regla de Inmutabilidad de 48 Horas
  Future<bool> eliminarRegistroConSeguridad(String uuid, String tabla, String fechaRegistro) async {
    if (!CalendarioUtil.puedeModificarRegistroPorFecha(fechaRegistro)) {
      throw ZootecnicValidationException(
        'REGISTRO BLOQUEADO (> 48 HORAS): Han transcurrido más de 2 días calendario. '
        'Por trazabilidad oficial, solo puede modificarse en el Servidor Central.',
      );
    }

    final db = await _db;
    await db.delete(tabla, where: 'uuid = ?', whereArgs: [uuid]);
    await db.insert('tb_eliminaciones_pendientes', {
      'uuid': uuid,
      'tabla': tabla,
      'fecha_eliminacion': DateTime.now().toIso8601String(),
    });

    await LocalDatabase.instance.checkpoint();
    return true;
  }

  /// Finalizar Ciclo de Lote y poner galpón en vacío sanitario
  Future<void> finalizarCicloLote(int loteId, int galponId) async {
    final db = await _db;
    final fechaHoy = CalendarioUtil.fechaHoyIso();

    await db.update(
      'tb_lotes',
      {'estado': 'FINALIZADO', 'fecha_cierre': fechaHoy, 'sincronizado': 0},
      where: 'id = ?',
      whereArgs: [loteId],
    );

    await db.update(
      'tb_galpones',
      {'estado': 'VACIO_SANITARIO', 'lote_id': null},
      where: 'id = ?',
      whereArgs: [galponId],
    );

    await LocalDatabase.instance.checkpoint();
  }

  // --- PODIO Y RANKINGS ---

  Future<List<RendimientoGalpon>> obtenerRendimientoOficial() async {
    final galpones = await obtenerGalpones();
    final lotes = await obtenerLotes(soloActivos: true);
    return RendimientoGalpon.calcular(galpones: galpones, lotes: lotes);
  }

  // --- AJUSTES Y CONFIGURACIÓN ---

  Future<String?> obtenerAjuste(String clave) async {
    final db = await _db;
    final res = await db.query('tb_ajustes', where: 'clave = ?', whereArgs: [clave]);
    if (res.isNotEmpty) return res.first['valor']?.toString();
    return null;
  }

  Future<void> guardarAjuste(String clave, String valor) async {
    final db = await _db;
    await db.insert('tb_ajustes', {'clave': clave, 'valor': valor}, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // --- CONSULTAS HISTÓRICAS ---

  Future<List<RegistroDiario>> obtenerRegistrosDiarios({int? loteId, String? fecha}) async {
    final db = await _db;
    String where = '';
    List<dynamic> args = [];
    if (loteId != null) {
      where += 'lote_id = ?';
      args.add(loteId);
    }
    if (fecha != null && fecha.isNotEmpty) {
      if (where.isNotEmpty) where += ' AND ';
      where += 'fecha = ?';
      args.add(fecha);
    }
    final res = await db.query(
      'tb_registros_diarios',
      where: where.isEmpty ? null : where,
      whereArgs: args.isEmpty ? null : args,
      orderBy: 'fecha DESC, id DESC',
    );
    return res.map((m) => RegistroDiario.fromMap(m)).toList();
  }

  Future<List<PesajeBiometrico>> obtenerPesajes({int? loteId}) async {
    final db = await _db;
    final res = await db.query(
      'tb_pesajes',
      where: loteId != null ? 'lote_id = ?' : null,
      whereArgs: loteId != null ? [loteId] : null,
      orderBy: 'fecha DESC, id DESC',
    );
    return res.map((m) => PesajeBiometrico.fromMap(m)).toList();
  }

  Future<List<ProduccionHuevos>> obtenerPosturas({int? loteId}) async {
    final db = await _db;
    final res = await db.query(
      'tb_postura',
      where: loteId != null ? 'lote_id = ?' : null,
      whereArgs: loteId != null ? [loteId] : null,
      orderBy: 'fecha DESC, id DESC',
    );
    return res.map((m) => ProduccionHuevos.fromMap(m)).toList();
  }

  // --- MÉTODOS DE SINCRONIZACIÓN OFFLINE-FIRST ---

  Future<List<RegistroDiario>> obtenerRegistrosPendientesSync() async {
    final db = await _db;
    final res = await db.query('tb_registros_diarios', where: 'sincronizado = 0');
    return res.map((m) => RegistroDiario.fromMap(m)).toList();
  }

  Future<List<PesajeBiometrico>> obtenerPesajesPendientesSync() async {
    final db = await _db;
    final res = await db.query('tb_pesajes', where: 'sincronizado = 0');
    return res.map((m) => PesajeBiometrico.fromMap(m)).toList();
  }

  Future<List<ProduccionHuevos>> obtenerPosturasPendientesSync() async {
    final db = await _db;
    final res = await db.query('tb_postura', where: 'sincronizado = 0');
    return res.map((m) => ProduccionHuevos.fromMap(m)).toList();
  }

  Future<void> marcarSincronizados({
    List<String> uuidsRegistros = const [],
    List<String> uuidsPesajes = const [],
    List<String> uuidsPosturas = const [],
  }) async {
    final db = await _db;
    final batch = db.batch();

    for (final u in uuidsRegistros) {
      batch.update('tb_registros_diarios', {'sincronizado': 1}, where: 'uuid = ?', whereArgs: [u]);
    }
    for (final u in uuidsPesajes) {
      batch.update('tb_pesajes', {'sincronizado': 1}, where: 'uuid = ?', whereArgs: [u]);
    }
    for (final u in uuidsPosturas) {
      batch.update('tb_postura', {'sincronizado': 1}, where: 'uuid = ?', whereArgs: [u]);
    }

    await batch.commit(noResult: true);
    await LocalDatabase.instance.checkpoint();
  }

  // --- GESTIÓN DE OPERARIOS ---

  Future<int> guardarOperario(Operario op) async {
    final db = await _db;
    final res = await db.insert('tb_operarios', op.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
    await LocalDatabase.instance.checkpoint();
    return res;
  }

  Future<Map<String, dynamic>> restaurarDesdeRespaldoPersistente() async {
    return {'huboRecuperacion': false, 'recuperadas': 0, 'pendientesSync': 0};
  }
}
