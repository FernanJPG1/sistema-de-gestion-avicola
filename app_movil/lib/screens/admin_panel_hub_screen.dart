// ============================================================================
// ARCHIVO: admin_panel_hub_screen.dart
// ¿QUÉ ES ESTA PANTALLA EXPLICADA DE FORMA SENCILLA?
// Imagínate que esta pantalla es EL ESCRITORIO DEL JEFE O SUPERVISOR GENERAL.
//
// Desde aquí se manejan las herramientas avanzadas de la granja avícola:
// 1. 🖨️ Centro de Impresión de Planillas PDF (listas para WhatsApp y auditorías).
// 2. 🏆 Liquidación y Ranking de Rendimiento Zootécnico (IEP, CA y Postura).
// 3. 👥 Gestión de Galponeros y Operarios (asignación y reemplazos de emergencia).
// 4. 🌐 Ajustes de Conexión y Servidor Central (probar Wi-Fi y cambiar IP).
// 5. 🛡️ Resguardo Persistente de Emergencia (Copia de seguridad en archivo JSON).
// ============================================================================

import 'package:flutter/material.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/repositories/db_repository.dart';
import 'package:app_movil/screens/reporte_dialog.dart';
import 'package:app_movil/screens/rendimiento_dialog.dart';
import 'package:app_movil/widgets/gestion_operarios_dialog.dart';
import 'package:app_movil/services/sync_service.dart';
import 'package:app_movil/services/persistent_backup_service.dart';

class AdminPanelHubScreen extends StatefulWidget {
  const AdminPanelHubScreen({super.key});

  @override
  State<AdminPanelHubScreen> createState() => _AdminPanelHubScreenState();
}

class _AdminPanelHubScreenState extends State<AdminPanelHubScreen> {
  final dbRepo = DbRepository();
  final syncService = SyncService();

  List<RegistroDiario> _registros = [];
  List<PesajeBiometrico> _pesajes = [];
  List<ProduccionHuevos> _posturas = [];
  List<Lote> _lotes = [];
  List<Galpon> _galpones = [];
  List<Operario> _operarios = [];
  List<RendimientoGalpon> _rendimientos = [];

  bool _cargando = true;
  String _servidorUrlActual = '';

  @override
  void initState() {
    super.initState();
    _cargarTodo();
  }

  Future<void> _cargarTodo() async {
    setState(() => _cargando = true);
    final regs = await dbRepo.obtenerRegistrosDiarios();
    final pes = await dbRepo.obtenerPesajes();
    final post = await dbRepo.obtenerPosturas();
    final lts = await dbRepo.obtenerLotes();
    final galps = await dbRepo.obtenerGalpones();
    final ops = await dbRepo.obtenerOperarios();
    final rends = await dbRepo.obtenerRendimientoOficial();
    final url = await syncService.getBaseUrl();

    setState(() {
      _registros = regs;
      _pesajes = pes;
      _posturas = post;
      _lotes = lts;
      _galpones = galps;
      _operarios = ops;
      _rendimientos = rends;
      _servidorUrlActual = url;
      _cargando = false;
    });
  }

  void _abrirImpresionReportes() {
    showDialog(
      context: context,
      builder: (_) => ReporteDialog(
        registros: _registros,
        pesajes: _pesajes,
        posturas: _posturas,
        lotes: _lotes,
        galpones: _galpones,
        operarios: _operarios,
      ),
    );
  }

  void _abrirPodioRendimiento() {
    showDialog(
      context: context,
      builder: (_) => RendimientoDialog(rendimientos: _rendimientos),
    );
  }

  void _abrirGestionOperarios() async {
    await showDialog(
      context: context,
      builder: (_) => const GestionOperariosDialog(),
    );
    await _cargarTodo();
  }

  Future<void> _configurarServidor() async {
    final ctrl = TextEditingController(text: _servidorUrlActual);
    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Configurar Conexión al Servidor Central'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ingrese la URL base del servidor FastAPI en la red de la oficina (ej: http://192.168.1.39:8000/api/v1):',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              decoration: const InputDecoration(
                labelText: 'URL del Servidor',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          TextButton(
            onPressed: () async {
              final ok = await syncService.probarConexion(ctrl.text.trim());
              if (!mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(ok ? '✅ Conexión con el Servidor Exitosa' : '❌ No se pudo conectar al Servidor'),
                  backgroundColor: ok ? Colors.green : Colors.red,
                ),
              );
            },
            child: const Text('Probar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF33691E), foregroundColor: Colors.white),
            onPressed: () async {
              await syncService.guardarUrlServidor(ctrl.text.trim());
              Navigator.pop(ctx);
              await _cargarTodo();
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  Future<void> _ejecutarCopiaEmergencia() async {
    final ruta = await PersistentBackupService.instance.resguardarRegistros();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ruta != null ? '✅ Copia persistente JSON creada con éxito:\n$ruta' : 'Error al crear copia.'),
        backgroundColor: const Color(0xFF2E7D32),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel de Administración y Supervisión', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF33691E),
        foregroundColor: Colors.white,
      ),
      body: _cargando
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Cabecera descriptiva
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F8E9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFC5E1A5)),
                  ),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        radius: 24,
                        backgroundColor: Color(0xFF7CB342),
                        child: Icon(Icons.admin_panel_settings, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Módulo Central de Supervisión', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20))),
                            const SizedBox(height: 2),
                            Text('Servidor actual: $_servidorUrlActual', style: const TextStyle(fontSize: 11, color: Colors.black54)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _buildMenuCard(
                  icon: Icons.picture_as_pdf,
                  iconColor: Colors.red.shade700,
                  title: 'Centro de Impresión de Planillas Oficiales',
                  subtitle: 'Generar reportes PDF zootécnicos para imprimir o enviar por WhatsApp.',
                  onTap: _abrirImpresionReportes,
                ),
                const SizedBox(height: 12),
                _buildMenuCard(
                  icon: Icons.emoji_events,
                  iconColor: const Color(0xFFFFA000),
                  title: 'Liquidación y Ranking de Rendimiento Zootécnico',
                  subtitle: 'Podio de Medallas (Oro, Plata, Bronce) por IEP y Conversión Alimenticia.',
                  onTap: _abrirPodioRendimiento,
                ),
                const SizedBox(height: 12),
                _buildMenuCard(
                  icon: Icons.people_alt,
                  iconColor: const Color(0xFF1565C0),
                  title: 'Gestión de Galponeros y Operarios',
                  subtitle: 'Listado oficial de personal y creación de operarios temporales de emergencia.',
                  onTap: _abrirGestionOperarios,
                ),
                const SizedBox(height: 12),
                _buildMenuCard(
                  icon: Icons.wifi,
                  iconColor: const Color(0xFF7CB342),
                  title: 'Ajustes de Conexión y Servidor Central',
                  subtitle: 'Configurar y diagnosticar la dirección IP del servidor en la red Wi-Fi.',
                  onTap: _configurarServidor,
                ),
                const SizedBox(height: 12),
                _buildMenuCard(
                  icon: Icons.shield,
                  iconColor: Colors.teal.shade700,
                  title: 'Resguardo de Emergencia (Backup JSON)',
                  subtitle: 'Generar copia de respaldo persistente para prevención de pérdida de datos.',
                  onTap: _ejecutarCopiaEmergencia,
                ),
              ],
            ),
    );
  }

  Widget _buildMenuCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: iconColor.withValues(alpha: 0.12),
          child: Icon(icon, color: iconColor),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.black54)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }
}
