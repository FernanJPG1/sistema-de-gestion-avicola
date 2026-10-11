// ============================================================================
// ARCHIVO: historial_screen.dart
// ¿QUÉ ES ESTA PANTALLA EXPLICADA DE FORMA SENCILLA?
// Imagínate que esta pantalla es EL BUZÓN DE CARTAS O LA BANDEJA DE SALIDA.
//
// Aquí se muestran los registros tomados en los galpones que están pendientes
// por subir al servidor central FastAPI cuando el dispositivo se conecte al Wi-Fi:
//
// 1. EL RELOJITO DE ESPERA:
//    Cada registro pendiente muestra un relojito naranja (sincronizado = 0).
//
// 2. CANDADO DE SEGURIDAD DE 48 HORAS:
//    Si el registro tiene menos de 48 horas, se muestra con candado verde (Editable).
//    Si supera las 48 horas, aparece el candado dorado cerrado (Bloqueado) por auditoría.
//
// 3. BOTÓN DE SINCRONIZACIÓN INMEDIATA:
//    Al presionar "Sincronizar", envía el paquete de registros por la red local.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:app_movil/repositories/db_repository.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/services/sync_service.dart';
import 'package:app_movil/utils/calendario_util.dart';

class HistorialScreen extends StatefulWidget {
  const HistorialScreen({super.key});

  @override
  State<HistorialScreen> createState() => _HistorialScreenState();
}

class _HistorialScreenState extends State<HistorialScreen> {
  final dbRepo = DbRepository();
  final syncService = SyncService();

  List<RegistroDiario> pendientes = [];
  List<RegistroDiario> todos = [];
  bool cargando = true;
  bool sincronizando = false;
  String filtro = 'PENDIENTES'; // 'PENDIENTES' o 'TODOS'

  @override
  void initState() {
    super.initState();
    _cargarRegistros();
  }

  Future<void> _cargarRegistros() async {
    setState(() => cargando = true);
    final pends = await dbRepo.obtenerRegistrosPendientesSync();
    final all = await dbRepo.obtenerRegistrosDiarios();
    setState(() {
      pendientes = pends;
      todos = all;
      cargando = false;
    });
  }

  Future<void> _ejecutarSincronizacion() async {
    setState(() => sincronizando = true);
    final res = await syncService.sincronizarTodo();
    setState(() => sincronizando = false);

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(res.mensaje),
        backgroundColor: res.exitoso ? const Color(0xFF2E7D32) : Colors.red.shade700,
        duration: const Duration(seconds: 4),
      ),
    );

    if (res.exitoso) {
      await _cargarRegistros();
    }
  }

  Future<void> _eliminarRegistro(RegistroDiario reg) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('¿Eliminar Registro de Campo?'),
        content: Text('Se descartará el registro del día ${reg.diaVida} (${reg.fecha}).'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmar == true) {
      try {
        await dbRepo.eliminarRegistroConSeguridad(reg.uuid, 'tb_registros_diarios', reg.fecha);
        await _cargarRegistros();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Registro eliminado con éxito.'), backgroundColor: Colors.green),
        );
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final listaMostrar = filtro == 'PENDIENTES' ? pendientes : todos;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buzón y Bandeja de Sincronización', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF33691E),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Recargar',
            onPressed: _cargarRegistros,
          ),
        ],
      ),
      body: Column(
        children: [
          // Barra de estado y pestañas
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFFF1F8E9),
            child: Row(
              children: [
                Expanded(
                  child: SegmentedButton<String>(
                    segments: [
                      ButtonSegment(
                        value: 'PENDIENTES',
                        label: Text('Pendientes (${pendientes.length})'),
                        icon: const Icon(Icons.access_time, size: 16),
                      ),
                      ButtonSegment(
                        value: 'TODOS',
                        label: Text('Historial (${todos.length})'),
                        icon: const Icon(Icons.list_alt, size: 16),
                      ),
                    ],
                    selected: {filtro},
                    onSelectionChanged: (val) => setState(() => filtro = val.first),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: cargando
                ? const Center(child: CircularProgressIndicator())
                : listaMostrar.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              filtro == 'PENDIENTES' ? Icons.cloud_done : Icons.inbox,
                              size: 64,
                              color: const Color(0xFF7CB342),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              filtro == 'PENDIENTES'
                                  ? '¡Todo al día! No hay registros pendientes de envío.'
                                  : 'No se encontraron registros de campo.',
                              style: const TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: listaMostrar.length,
                        padding: const EdgeInsets.all(12),
                        itemBuilder: (ctx, i) {
                          final reg = listaMostrar[i];
                          final editable = CalendarioUtil.puedeModificarRegistroPorFecha(reg.fecha);
                          final sincronizado = reg.sincronizado == 1;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(
                                color: sincronizado ? Colors.grey.shade300 : const Color(0xFFFFA000),
                                width: sincronizado ? 1 : 1.5,
                              ),
                            ),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: sincronizado ? const Color(0xFFE8F5E9) : const Color(0xFFFFF8E1),
                                child: Icon(
                                  sincronizado ? Icons.check_circle : Icons.schedule,
                                  color: sincronizado ? const Color(0xFF2E7D32) : const Color(0xFFFFA000),
                                ),
                              ),
                              title: Text(
                                'Día ${reg.diaVida} - ${reg.fecha}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Mort: ${reg.mortalidad} | Desc: ${reg.descarte} | Alim: ${reg.alimentoKg} Kg | Agua: ${reg.aguaLitros} L'),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: editable ? const Color(0xFFE8F5E9) : const Color(0xFFFFF3E0),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          editable ? '🔓 Editable (<48h)' : '🔒 Bloqueado (>48h)',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: editable ? const Color(0xFF2E7D32) : const Color(0xFFE65100),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              trailing: editable
                                  ? IconButton(
                                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                                      onPressed: () => _eliminarRegistro(reg),
                                    )
                                  : const Icon(Icons.lock, color: Color(0xFFFFA000), size: 18),
                            ),
                          );
                        },
                      ),
          ),
          // Botón inferior de sincronización masiva
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 6,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                icon: sincronizando
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.sync),
                label: Text(
                  sincronizando ? 'Sincronizando con Servidor...' : 'SINCRONIZAR AHORA (${pendientes.length} pendientes)',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1565C0),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: sincronizando ? null : _ejecutarSincronizacion,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
