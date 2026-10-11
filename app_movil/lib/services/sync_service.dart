// ============================================================================
// ARCHIVO: sync_service.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Imagínate que este archivo es EL CAMIÓN REPARTIDOR O MENSAJERO INALÁMBRICO de la granja.
//
// En los galpones avícolas alejados muchas veces no hay internet ni señal celular.
// Por eso, la app trabaja 100% desconectada (Offline-First).
// Pero cuando el galponero o supervisor llega a la administración y agarra el Wi-Fi:
//
// 1. VIAJE DE IDA (Subir Registros de Campo):
//    El mensajero busca en el teléfono todos los registros con el relojito de espera
//    (sincronizado = 0): mortalidades, consumos de alimento/agua, pesajes y postura de huevos.
//    Se los entrega al servidor central FastAPI.
//
// 2. SELLO DE RECIBIDO:
//    La oficina confirma la recepción y el mensajero le pone el chulito verde (sincronizado = 1)
//    a cada registro en el celular.
//
// 3. VIAJE DE VENIDA (Descargar Catálogos):
//    Trae la lista actualizada de granjas, galpones y nuevos lotes encasetados.
// ============================================================================

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/repositories/db_repository.dart';

class SyncService {
  // URLs por defecto (Emulador Android y Red Local de Granja)
  static const String defaultUrl = 'http://10.0.2.2:8000/api/v1';
  static const String fallbackLanUrl = 'http://192.168.1.39:8000/api/v1';
  static String? _cachedBaseUrl;

  String? ultimoError;
  String? ultimaUrlProbada;

  final dbRepo = DbRepository();
  final _uuid = const Uuid();

  /// Obtiene la URL base configurada o por defecto
  Future<String> getBaseUrl() async {
    if (_cachedBaseUrl != null && _cachedBaseUrl!.isNotEmpty) {
      return _cachedBaseUrl!;
    }
    final saved = await dbRepo.obtenerAjuste('server_url');
    if (saved != null && saved.trim().isNotEmpty) {
      _cachedBaseUrl = saved.trim();
      return _cachedBaseUrl!;
    }
    _cachedBaseUrl = fallbackLanUrl;
    return _cachedBaseUrl!;
  }

  /// Guarda una nueva URL del servidor central
  Future<void> guardarUrlServidor(String url) async {
    String limpia = url.trim();
    if (limpia.endsWith('/')) {
      limpia = limpia.substring(0, limpia.length - 1);
    }
    _cachedBaseUrl = limpia;
    await dbRepo.guardarAjuste('server_url', limpia);
  }

  /// Prueba la conectividad con el servidor central
  Future<bool> probarConexion([String? urlCustom]) async {
    final urlBase = urlCustom ?? await getBaseUrl();
    ultimaUrlProbada = urlBase;
    try {
      final res = await http.get(
        Uri.parse('$urlBase/health/'),
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (e) {
      ultimoError = e.toString();
      return false;
    }
  }

  /// Realiza la sincronización bidireccional completa
  Future<SyncResult> sincronizarTodo() async {
    final urlBase = await getBaseUrl();
    ultimoError = null;

    try {
      // 1. Obtener registros pendientes locales
      final regsPendientes = await dbRepo.obtenerRegistrosPendientesSync();
      final pesajesPendientes = await dbRepo.obtenerPesajesPendientesSync();
      final posturasPendientes = await dbRepo.obtenerPosturasPendientesSync();

      final totalPendientes = regsPendientes.length + pesajesPendientes.length + posturasPendientes.length;

      // 2. Si no hay nada pendiente de enviar, verificar si el servidor responde
      final hayConexion = await probarConexion(urlBase);
      if (!hayConexion) {
        return SyncResult(
          exitoso: false,
          mensaje: 'No se pudo conectar al servidor en $urlBase. Verifique la red Wi-Fi.',
          enviados: 0,
        );
      }

      // 3. Preparar el Payload JSON
      final payload = {
        'dispositivo_id': 'DISP-MOVIL-${_uuid.v4().substring(0, 8)}',
        'registros_diarios': regsPendientes.map((r) => r.toMap()).toList(),
        'pesajes': pesajesPendientes.map((p) => p.toMap()).toList(),
        'posturas': posturasPendientes.map((post) => post.toMap()).toList(),
        'eliminaciones': [],
      };

      // 4. Enviar al endpoint de sincronización
      final res = await http.post(
        Uri.parse('$urlBase/sync/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 15));

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);

        // 5. Marcar como sincronizados en SQLite local
        final uuidsRegs = regsPendientes.map((r) => r.uuid).toList();
        final uuidsPesajes = pesajesPendientes.map((p) => p.uuid).toList();
        final uuidsPosturas = posturasPendientes.map((post) => post.uuid).toList();

        await dbRepo.marcarSincronizados(
          uuidsRegistros: uuidsRegs,
          uuidsPesajes: uuidsPesajes,
          uuidsPosturas: uuidsPosturas,
        );

        return SyncResult(
          exitoso: true,
          mensaje: data['message'] ?? 'Sincronización completada con éxito.',
          enviados: totalPendientes,
        );
      } else {
        return SyncResult(
          exitoso: false,
          mensaje: 'Error del servidor: código ${res.statusCode}',
          enviados: 0,
        );
      }
    } catch (e) {
      ultimoError = e.toString();
      return SyncResult(
        exitoso: false,
        mensaje: 'Error durante la sincronización: $e',
        enviados: 0,
      );
    }
  }
}

class SyncResult {
  final bool exitoso;
  final String mensaje;
  final int enviados;

  SyncResult({
    required this.exitoso,
    required this.mensaje,
    required this.enviados,
  });
}
