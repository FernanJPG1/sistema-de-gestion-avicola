// ============================================================================
// ARCHIVO: form_produccion_huevos_screen.dart
// ¿QUÉ ES ESTA PANTALLA EXPLICADA DE FORMA SENCILLA?
// Es la planilla táctil de recolección de huevos en los galpones de ponedoras.
//
// 1. Permite registrar por canastas/cubetas de 30 huevos con botones rápidos.
// 2. Clasifica por calibres comerciales colombianos (Jumbo, AAA, AA, A, B, C).
// 3. Separa huevos rotos, sucios o fisurados.
// 4. Calcula en tiempo real el % de Postura diario del galpón.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/repositories/db_repository.dart';
import 'package:app_movil/utils/calendario_util.dart';
import 'package:app_movil/widgets/quantity_controller.dart';

class FormProduccionHuevosScreen extends StatefulWidget {
  final Lote? loteInicial;

  const FormProduccionHuevosScreen({super.key, this.loteInicial});

  @override
  State<FormProduccionHuevosScreen> createState() => _FormProduccionHuevosScreenState();
}

class _FormProduccionHuevosScreenState extends State<FormProduccionHuevosScreen> {
  final _db = DbRepository();
  final _uuid = const Uuid();

  List<Lote> _lotesPonedoras = [];
  Lote? _loteSeleccionado;
  bool _cargando = true;
  bool _guardando = false;

  int _canastasCompletas = 0; // 30 huevos por cubeta
  int _jumbo = 0;
  int _aaa = 0;
  int _aa = 0;
  int _a = 0;
  int _b = 0;
  int _rotos = 0;
  int _sucios = 0;

  @override
  void initState() {
    super.initState();
    _cargarLotes();
  }

  Future<void> _cargarLotes() async {
    final lotes = await _db.obtenerLotes(soloActivos: true, tipoAve: 'PONEDORA');
    setState(() {
      _lotesPonedoras = lotes;
      if (widget.loteInicial != null) {
        _loteSeleccionado = widget.loteInicial;
      } else if (lotes.isNotEmpty) {
        _loteSeleccionado = lotes.first;
      }
      _cargando = false;
    });
  }

  int get _huevosComerciales => _jumbo + _aaa + _aa + _a + _b;
  int get _huevosTotales => _huevosComerciales + _rotos + _sucios;

  double get _posturaPct {
    if (_loteSeleccionado == null || _loteSeleccionado!.cantidadActual <= 0) return 0.0;
    return (_huevosTotales / _loteSeleccionado!.cantidadActual) * 100.0;
  }

  void _agregarCanastas(int n) {
    setState(() {
      _canastasCompletas = (_canastasCompletas + n).clamp(0, 500);
      // Distribución proporcional rápida a calibre AA / AAA (los más frecuentes)
      _aaa += (n * 15);
      _aa += (n * 15);
    });
  }

  Future<void> _guardar() async {
    if (_loteSeleccionado == null) return;
    if (_huevosTotales <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Debe registrar al menos un huevo producido.'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() => _guardando = true);
    try {
      final fechaHoy = CalendarioUtil.fechaHoyIso();
      final postura = ProduccionHuevos(
        uuid: _uuid.v4(),
        loteId: _loteSeleccionado!.id,
        fecha: fechaHoy,
        huevosTotales: _huevosTotales,
        huevosComerciales: _huevosComerciales,
        huevosRotos: _rotos,
        huevosSucios: _sucios,
        calibreJumbo: _jumbo,
        calibreAaa: _aaa,
        calibreAa: _aa,
        calibreA: _a,
        calibreB: _b,
        posturaPct: _posturaPct,
        createdAt: DateTime.now().toIso8601String(),
        sincronizado: 0,
      );

      await _db.guardarPostura(postura);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Producción guardada: $_huevosTotales huevos (${_posturaPct.toStringAsFixed(1)}% postura)'),
          backgroundColor: const Color(0xFF2E7D32),
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al guardar: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _guardando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recolección de Huevos', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF33691E),
        foregroundColor: Colors.white,
      ),
      body: _cargando
          ? const Center(child: CircularProgressIndicator())
          : _lotesPonedoras.isEmpty
              ? const Center(
                  child: Text('No hay lotes de ponedoras activos disponibles.', style: TextStyle(color: Colors.grey)),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Selección de Lote
                    DropdownButtonFormField<Lote>(
                      value: _loteSeleccionado,
                      decoration: InputDecoration(
                        labelText: 'Lote de Gallinas Ponedoras',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        prefixIcon: const Icon(Icons.egg_alt, color: Color(0xFF7CB342)),
                      ),
                      items: _lotesPonedoras.map((l) {
                        return DropdownMenuItem(
                          value: l,
                          child: Text('${l.codigoLote} (${l.cantidadActual} aves vivas)'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _loteSeleccionado = val);
                      },
                    ),
                    const SizedBox(height: 16),

                    // Tarjeta de resumen de Postura en tiempo real
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF9FBE7),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFC5E1A5)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Column(
                            children: [
                              const Text('TOTAL HUEVOS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Text('$_huevosTotales', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF33691E))),
                            ],
                          ),
                          Column(
                            children: [
                              const Text('POSTURA ESTIMADA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Text('${_posturaPct.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFFE65100))),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Botones rápidos de canastas (30 huevos)
                    const Text('RECOLECCIÓN POR CANASTAS (30 HUEVOS / CUBETA)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF33691E))),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        ElevatedButton.icon(
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('+1 Cubeta (30)'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDCEDC8), foregroundColor: const Color(0xFF33691E)),
                          onPressed: () => _agregarCanastas(1),
                        ),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('+5 Cubetas (150)'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDCEDC8), foregroundColor: const Color(0xFF33691E)),
                          onPressed: () => _agregarCanastas(5),
                        ),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('+10 Cubetas (300)'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDCEDC8), foregroundColor: const Color(0xFF33691E)),
                          onPressed: () => _agregarCanastas(10),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Calibres comerciales
                    const Text('CLASIFICACIÓN POR CALIBRES COMERCIALES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF33691E))),
                    const SizedBox(height: 10),
                    QuantityController(label: 'Jumbo (>78g)', quantity: _jumbo, onChanged: (v) => setState(() => _jumbo = v)),
                    const SizedBox(height: 10),
                    QuantityController(label: 'AAA (67g - 77g)', quantity: _aaa, onChanged: (v) => setState(() => _aaa = v)),
                    const SizedBox(height: 10),
                    QuantityController(label: 'AA (60g - 66g)', quantity: _aa, onChanged: (v) => setState(() => _aa = v)),
                    const SizedBox(height: 10),
                    QuantityController(label: 'A (53g - 59g)', quantity: _a, onChanged: (v) => setState(() => _a = v)),
                    const SizedBox(height: 10),
                    QuantityController(label: 'B (46g - 52g)', quantity: _b, onChanged: (v) => setState(() => _b = v)),
                    const SizedBox(height: 16),

                    // Huevos no conformes
                    const Text('HUEVOS NO CONFORMES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red)),
                    const SizedBox(height: 10),
                    QuantityController(label: 'Rotos / Fisurados', quantity: _rotos, onChanged: (v) => setState(() => _rotos = v)),
                    const SizedBox(height: 10),
                    QuantityController(label: 'Sucios / Manchados', quantity: _sucios, onChanged: (v) => setState(() => _sucios = v)),
                    const SizedBox(height: 24),

                    // Botón Guardar
                    ElevatedButton.icon(
                      icon: _guardando
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Icon(Icons.save),
                      label: Text(_guardando ? 'Guardando...' : 'GUARDAR POSTURA EN SQLITE'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7CB342),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _guardando ? null : _guardar,
                    ),
                  ],
                ),
    );
  }
}
