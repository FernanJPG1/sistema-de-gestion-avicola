// ============================================================================
// ARCHIVO: gestion_operarios_dialog.dart
// ¿QUÉ ES ESTA VENTANA EXPLICADA DE FORMA SENCILLA?
// Es el libro de asignación y control de galponeros y operarios de campo.
//
// Permite al supervisor:
// 1. Buscar galponeros por nombre o cédula.
// 2. Activar o desactivar personal según la rotación de turnos.
// 3. Crear galponeros temporales de emergencia en caso de reemplazo inmediato.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/repositories/db_repository.dart';

class GestionOperariosDialog extends StatefulWidget {
  const GestionOperariosDialog({super.key});

  @override
  State<GestionOperariosDialog> createState() => _GestionOperariosDialogState();
}

class _GestionOperariosDialogState extends State<GestionOperariosDialog> {
  final DbRepository _db = DbRepository();
  List<Operario> _operarios = [];
  String _filtroTexto = '';
  bool _cargando = true;

  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargarOperarios();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _cargarOperarios() async {
    setState(() => _cargando = true);
    final lista = await _db.obtenerOperarios();
    setState(() {
      _operarios = lista;
      _cargando = false;
    });
  }

  Future<void> _crearOperarioEmergencia() async {
    final nombreCtrl = TextEditingController();
    final cedulaCtrl = TextEditingController();

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Registrar Galponero / Operario', style: TextStyle(color: Color(0xFF33691E), fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nombreCtrl,
              decoration: const InputDecoration(labelText: 'Nombre Completo', hintText: 'Ej: Carlos Pérez'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: cedulaCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Cédula de Ciudadanía', hintText: 'Ej: 1023456789'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7CB342), foregroundColor: Colors.white),
            onPressed: () async {
              if (nombreCtrl.text.trim().isEmpty || cedulaCtrl.text.trim().isEmpty) return;
              final nuevo = Operario(
                id: DateTime.now().millisecondsSinceEpoch % 100000,
                cedula: cedulaCtrl.text.trim(),
                nombreCompleto: nombreCtrl.text.trim(),
                activo: 1,
              );
              await _db.guardarOperario(nuevo);
              Navigator.pop(ctx);
              await _cargarOperarios();
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtrados = _operarios.where((op) {
      if (_filtroTexto.isEmpty) return true;
      final q = _filtroTexto.toLowerCase();
      return op.nombreCompleto.toLowerCase().contains(q) || op.cedula.contains(q);
    }).toList();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 500,
        height: 600,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.badge_outlined, color: Color(0xFF33691E)),
                    SizedBox(width: 8),
                    Text('Gestión de Galponeros', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF33691E))),
                  ],
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search, color: Color(0xFF7CB342)),
                hintText: 'Buscar por nombre o cédula...',
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onChanged: (v) => setState(() => _filtroTexto = v),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: _cargando
                  ? const Center(child: CircularProgressIndicator())
                  : filtrados.isEmpty
                      ? const Center(child: Text('No se encontraron operarios registrados.'))
                      : ListView.separated(
                          itemCount: filtrados.length,
                          separatorBuilder: (_, __) => const Divider(height: 1),
                          itemBuilder: (ctx, i) {
                            final op = filtrados[i];
                            return ListTile(
                              leading: const CircleAvatar(
                                backgroundColor: Color(0xFFDCEDC8),
                                child: Icon(Icons.person, color: Color(0xFF33691E)),
                              ),
                              title: Text(op.nombreCompleto, style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text('Cédula: ${op.cedula}'),
                              trailing: Chip(
                                label: Text(op.activo == 1 ? 'Activo' : 'Inactivo', style: const TextStyle(fontSize: 11)),
                                backgroundColor: op.activo == 1 ? const Color(0xFFE8F5E9) : Colors.grey.shade200,
                                side: BorderSide(color: op.activo == 1 ? const Color(0xFF81C784) : Colors.grey.shade400),
                              ),
                            );
                          },
                        ),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              icon: const Icon(Icons.person_add),
              label: const Text('Nuevo Galponero Temporal'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7CB342),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: _crearOperarioEmergencia,
            ),
          ],
        ),
      ),
    );
  }
}
