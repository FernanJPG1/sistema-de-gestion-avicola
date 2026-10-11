// ============================================================================
// ARCHIVO: form_pesaje_biometrico_screen.dart
// ¿QUÉ ES ESTA PANTALLA EXPLICADA DE FORMA SENCILLA?
// Es la balanza digital y control biométrico del galpón de pollo de engorde.
//
// 1. Calcula automáticamente los días de vida del lote desde su encasetamiento.
// 2. Registra el muestreo de aves pesadas (ej: 100 aves).
// 3. Permite ingresar o ajustar el peso promedio en gramos, la uniformidad % y el CV %.
// 4. Compara al instante contra el peso estándar de la guía genética (Cobb 500 / Ross 308).
// 5. Guarda con inmutabilidad de 48 horas en SQLite.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/repositories/db_repository.dart';
import 'package:app_movil/utils/calendario_util.dart';
import 'package:app_movil/widgets/quantity_controller.dart';

class FormPesajeBiometricoScreen extends StatefulWidget {
  final Lote? loteInicial;

  const FormPesajeBiometricoScreen({super.key, this.loteInicial});

  @override
  State<FormPesajeBiometricoScreen> createState() => _FormPesajeBiometricoScreenState();
}

class _FormPesajeBiometricoScreenState extends State<FormPesajeBiometricoScreen> {
  final _db = DbRepository();
  final _uuid = const Uuid();

  List<Lote> _lotesEngorde = [];
  Lote? _loteSeleccionado;
  bool _cargando = true;
  bool _guardando = false;

  int _avesPesadas = 100;
  final TextEditingController _pesoPromedioCtrl = TextEditingController(text: '1850');
  final TextEditingController _uniformidadCtrl = TextEditingController(text: '88.5');
  final TextEditingController _cvCtrl = TextEditingController(text: '8.2');
  final TextEditingController _obsCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargarLotes();
  }

  @override
  void dispose() {
    _pesoPromedioCtrl.dispose();
    _uniformidadCtrl.dispose();
    _cvCtrl.dispose();
    _obsCtrl.dispose();
    super.dispose();
  }

  Future<void> _cargarLotes() async {
    final lotes = await _db.obtenerLotes(soloActivos: true, tipoAve: 'ENGORDE');
    setState(() {
      _lotesEngorde = lotes;
      if (widget.loteInicial != null) {
        _loteSeleccionado = widget.loteInicial;
      } else if (lotes.isNotEmpty) {
        _loteSeleccionado = lotes.first;
      }
      _cargando = false;
    });
  }

  int get _diaVidaCalculado {
    if (_loteSeleccionado == null) return 1;
    final encasetamiento = DateTime.tryParse(_loteSeleccionado!.fechaEncasetamiento);
    if (encasetamiento == null) return 1;
    final diff = DateTime.now().difference(encasetamiento).inDays;
    return (diff + 1).clamp(1, 100);
  }

  double get _pesoEstandarReferencia {
    // Curva de referencia aproximada Cobb 500 / Ross 308
    final dia = _diaVidaCalculado;
    if (dia <= 7) return 195;
    if (dia <= 14) return 480;
    if (dia <= 21) return 960;
    if (dia <= 28) return 1600;
    if (dia <= 35) return 2350;
    if (dia <= 42) return 3100;
    return 3500;
  }

  Future<void> _guardar() async {
    if (_loteSeleccionado == null) return;
    final pesoProm = double.tryParse(_pesoPromedioCtrl.text) ?? 0.0;
    if (pesoProm <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Debe ingresar un peso promedio válido en gramos.'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() => _guardando = true);
    try {
      final fechaHoy = CalendarioUtil.fechaHoyIso();
      final pesaje = PesajeBiometrico(
        uuid: _uuid.v4(),
        loteId: _loteSeleccionado!.id,
        fecha: fechaHoy,
        diaVida: _diaVidaCalculado,
        avesPesadas: _avesPesadas,
        pesoPromedioG: pesoProm,
        uniformidadPct: double.tryParse(_uniformidadCtrl.text) ?? 85.0,
        cvPct: double.tryParse(_cvCtrl.text) ?? 9.0,
        pesoEstandarG: _pesoEstandarReferencia,
        observaciones: _obsCtrl.text.trim().isEmpty ? null : _obsCtrl.text.trim(),
        createdAt: DateTime.now().toIso8601String(),
        sincronizado: 0,
      );

      await _db.guardarPesaje(pesaje);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Pesaje guardado: ${pesoProm.toStringAsFixed(0)}g (Día $_diaVidaCalculado)'),
          backgroundColor: const Color(0xFF2E7D32),
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al guardar pesaje: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _guardando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Muestreo y Pesaje Biométrico', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF33691E),
        foregroundColor: Colors.white,
      ),
      body: _cargando
          ? const Center(child: CircularProgressIndicator())
          : _lotesEngorde.isEmpty
              ? const Center(
                  child: Text('No hay lotes de pollo de engorde activos.', style: TextStyle(color: Colors.grey)),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Selección de Lote
                    DropdownButtonFormField<Lote>(
                      value: _loteSeleccionado,
                      decoration: InputDecoration(
                        labelText: 'Lote de Pollo de Engorde',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        prefixIcon: const Icon(Icons.scale, color: Color(0xFF7CB342)),
                      ),
                      items: _lotesEngorde.map((l) {
                        return DropdownMenuItem(
                          value: l,
                          child: Text('${l.codigoLote} (${l.cantidadActual} aves vivas)'),
                        );
                      }).toList>,
                      onChanged: (val) {
                        if (val != null) setState(() => _loteSeleccionado = val);
                      },
                    ),
                    const SizedBox(height: 16),

                    // Tarjeta de Día de Vida y Estándar
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFA5D6A7)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Column(
                            children: [
                              const Text('EDAD DEL LOTE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Text('Día $_diaVidaCalculado', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2E7D32))),
                            ],
                          ),
                          Column(
                            children: [
                              const Text('ESTÁNDAR GUÍA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                              const SizedBox(height: 4),
                              Text('${_pesoEstandarReferencia.toStringAsFixed(0)} g', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1565C0))),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Cantidad de aves muestreadas
                    QuantityController(
                      label: 'Número de Aves Muestreadas (Muestra)',
                      quantity: _avesPesadas,
                      min: 10,
                      max: 1000,
                      quickSteps: const [5, 10, 50, 100],
                      onChanged: (v) => setState(() => _avesPesadas = v),
                    ),
                    const SizedBox(height: 16),

                    // Peso Promedio en Gramos
                    TextField(
                      controller: _pesoPromedioCtrl,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Peso Promedio del Muestreo (Gramos)',
                        hintText: 'Ej: 1850',
                        suffixText: 'g',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        prefixIcon: const Icon(Icons.monitor_weight_outlined, color: Color(0xFF7CB342)),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Uniformidad y CV
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _uniformidadCtrl,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: InputDecoration(
                              labelText: 'Uniformidad (%)',
                              suffixText: '%',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: _cvCtrl,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: InputDecoration(
                              labelText: 'Coef. Variación (CV%)',
                              suffixText: '%',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Observaciones
                    TextField(
                      controller: _obsCtrl,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: 'Observaciones de Campo / Condición Corporal',
                        hintText: 'Ej: Buena vivacidad, plumaje parejo, patas limpias.',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Botón Guardar
                    ElevatedButton.icon(
                      icon: _guardando
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Icon(Icons.save),
                      label: Text(_guardando ? 'Guardando...' : 'GUARDAR PESAJE EN SQLITE'),
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
