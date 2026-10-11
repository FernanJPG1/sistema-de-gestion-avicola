// ============================================================================
// ARCHIVO: app_movil/lib/screens/form_registro_campo_screen.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es EL FORMULARIO TÁCTIL DE CAPTURA RÁPIDA EN GALPÓN.
//
// Diseñado con controles táctiles grandes para que el operario pueda anotar con facilidad:
// 1. Número de aves muertas o descartadas en el recorrido matutino.
// 2. Kilos de alimento entregados a los comederos automáticos o bultos de alimento.
// 3. Litros de agua medidos en el caudalímetro.
// 4. Temperaturas (mínima y máxima) y humedad ambiental.
//
// Al tocar "Guardar Registro", lo almacena en SQLite en menos de 5 milisegundos con UUID único.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/repositories/db_repository.dart';
import 'package:app_movil/utils/calendario_util.dart';
import 'package:app_movil/widgets/quantity_controller.dart';

class FormRegistroCampoScreen extends StatefulWidget {
  final String tipo; // 'ENGORDE', 'PONEDORA', 'PESAJE'

  const FormRegistroCampoScreen({super.key, required this.tipo});

  @override
  State<FormRegistroCampoScreen> createState() => _FormRegistroCampoScreenState();
}

class _FormRegistroCampoScreenState extends State<FormRegistroCampoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _db = DbRepository();
  final _uuid = const Uuid();

  List<Lote> _lotesDisponibles = [];
  List<Operario> _operarios = [];
  Lote? _loteSeleccionado;
  Operario? _operarioSeleccionado;
  bool _cargando = true;
  bool _guardando = false;

  int _mortalidad = 0;
  int _descarte = 0;
  final TextEditingController _alimentoCtrl = TextEditingController(text: '3100');
  final TextEditingController _aguaCtrl = TextEditingController(text: '5400');
  final TextEditingController _tempMinCtrl = TextEditingController(text: '22.5');
  final TextEditingController _tempMaxCtrl = TextEditingController(text: '31.0');
  final TextEditingController _humedadCtrl = TextEditingController(text: '65');
  final TextEditingController _observacionesCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargarCatalogos();
  }

  @override
  void dispose() {
    _alimentoCtrl.dispose();
    _aguaCtrl.dispose();
    _tempMinCtrl.dispose();
    _tempMaxCtrl.dispose();
    _humedadCtrl.dispose();
    _observacionesCtrl.dispose();
    super.dispose();
  }

  Future<void> _cargarCatalogos() async {
    final lotes = await _db.obtenerLotes(
      soloActivos: true,
      tipoAve: widget.tipo == 'PESAJE' ? 'ENGORDE' : widget.tipo,
    );
    final ops = await _db.obtenerOperarios();

    setState(() {
      _lotesDisponibles = lotes;
      _operarios = ops;
      if (lotes.isNotEmpty) _loteSeleccionado = lotes.first;
      if (ops.isNotEmpty) _operarioSeleccionado = ops.first;
      _cargando = false;
    });
  }

  int get _diaVidaCalculado {
    if (_loteSeleccionado == null) return 1;
    final encasetamiento = DateTime.tryParse(_loteSeleccionado!.fechaEncasetamiento);
    if (encasetamiento == null) return 1;
    final diff = DateTime.now().difference(encasetamiento).inDays;
    return (diff + 1).clamp(1, 120);
  }

  Future<void> _guardar() async {
    if (!_formKey.currentState!.validate() || _loteSeleccionado == null) return;

    setState(() => _guardando = true);
    try {
      final fechaHoy = CalendarioUtil.fechaHoyIso();
      final reg = RegistroDiario(
        uuid: _uuid.v4(),
        loteId: _loteSeleccionado!.id,
        fecha: fechaHoy,
        diaVida: _diaVidaCalculado,
        mortalidad: _mortalidad,
        descarte: _descarte,
        alimentoKg: double.tryParse(_alimentoCtrl.text) ?? 0.0,
        aguaLitros: double.tryParse(_aguaCtrl.text) ?? 0.0,
        tempMin: double.tryParse(_tempMinCtrl.text),
        tempMax: double.tryParse(_tempMaxCtrl.text),
        humedadPct: double.tryParse(_humedadCtrl.text),
        observaciones: _observacionesCtrl.text.trim().isEmpty ? null : _observacionesCtrl.text.trim(),
        operarioId: _operarioSeleccionado?.id,
        createdAt: DateTime.now().toIso8601String(),
        sincronizado: 0,
      );

      await _db.guardarRegistroDiario(reg);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Registro de campo guardado localmente en SQLite con éxito'),
          backgroundColor: Color(0xFF33691E),
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
      backgroundColor: const Color(0xFFF9FBE7),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7CB342),
        elevation: 2,
        title: Text(
          'Registro Diario en Galpón (${widget.tipo})',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 17),
        ),
      ),
      body: _cargando
          ? const Center(child: CircularProgressIndicator())
          : _lotesDisponibles.isEmpty
              ? const Center(child: Text('No hay lotes activos para esta categoría.'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Lote y Operario
                        Card(
                          elevation: 1.5,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                            side: const BorderSide(color: Color(0xFFC5E1A5)),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Lote y Galpón Activo:',
                                  style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF33691E)),
                                ),
                                const SizedBox(height: 8),
                                DropdownButtonFormField<Lote>(
                                  value: _loteSeleccionado,
                                  decoration: InputDecoration(
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  ),
                                  items: _lotesDisponibles.map((l) {
                                    return DropdownMenuItem(
                                      value: l,
                                      child: Text('${l.codigoLote} • Día $_diaVidaCalculado (${l.cantidadActual} aves)'),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _loteSeleccionado = val);
                                  },
                                ),
                                const SizedBox(height: 14),
                                const Text(
                                  'Galponero / Operario Responsable:',
                                  style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF33691E)),
                                ),
                                const SizedBox(height: 8),
                                DropdownButtonFormField<Operario>(
                                  value: _operarioSeleccionado,
                                  decoration: InputDecoration(
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  ),
                                  items: _operarios.map((op) {
                                    return DropdownMenuItem(
                                      value: op,
                                      child: Text(op.nombreCompleto),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _operarioSeleccionado = val);
                                  },
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Controles táctiles de Mortalidad y Descarte
                        QuantityController(
                          label: 'Mortalidad (Aves Muertas del Día)',
                          quantity: _mortalidad,
                          min: 0,
                          max: 500,
                          quickSteps: const [1, 5, 10, 25],
                          onChanged: (v) => setState(() => _mortalidad = v),
                        ),
                        const SizedBox(height: 12),
                        QuantityController(
                          label: 'Descarte / Selección Sanitaria',
                          quantity: _descarte,
                          min: 0,
                          max: 500,
                          quickSteps: const [1, 5, 10, 20],
                          onChanged: (v) => setState(() => _descarte = v),
                        ),
                        const SizedBox(height: 14),

                        // Alimento y Agua
                        Card(
                          elevation: 1.5,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                            side: const BorderSide(color: Color(0xFFC5E1A5)),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Consumos de Alimento y Agua:',
                                  style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF33691E)),
                                ),
                                const SizedBox(height: 12),
                                TextFormField(
                                  controller: _alimentoCtrl,
                                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                  decoration: InputDecoration(
                                    labelText: 'Alimento Entregado (Kg)',
                                    prefixIcon: const Icon(Icons.grain, color: Color(0xFF7CB342)),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                TextFormField(
                                  controller: _aguaCtrl,
                                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                  decoration: InputDecoration(
                                    labelText: 'Consumo de Agua (Litros)',
                                    prefixIcon: const Icon(Icons.water_drop_outlined, color: Colors.blue),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextFormField(
                                        controller: _tempMinCtrl,
                                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                        decoration: InputDecoration(
                                          labelText: 'T. Mín (°C)',
                                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: TextFormField(
                                        controller: _tempMaxCtrl,
                                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                        decoration: InputDecoration(
                                          labelText: 'T. Máx (°C)',
                                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: TextFormField(
                                        controller: _humedadCtrl,
                                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                        decoration: InputDecoration(
                                          labelText: 'Hum (%)',
                                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                TextFormField(
                                  controller: _observacionesCtrl,
                                  maxLines: 2,
                                  decoration: InputDecoration(
                                    labelText: 'Observaciones / Signos Clínicos',
                                    hintText: 'Ventilación óptima, sin signos clínicos...',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Botón Guardar
                        SizedBox(
                          height: 52,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF7CB342),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              elevation: 3,
                            ),
                            icon: _guardando
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : const Icon(Icons.save_outlined, color: Colors.white, size: 24),
                            label: const Text(
                              'GUARDAR REGISTRO LOCAL EN SQLITE',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                            onPressed: _guardando ? null : _guardar,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }
}
