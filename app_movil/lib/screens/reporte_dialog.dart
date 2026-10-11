// ============================================================================
// ARCHIVO: reporte_dialog.dart
// ¿QUÉ ES ESTA VENTANA EXPLICADA DE FORMA SENCILLA?
// Es el centro de impresión digital de la granja avícola.
//
// Permite al administrador o zootecnista configurar el informe técnico:
// 1. Elegir el módulo (Seguimiento Diario, Producción de Huevos, Pesajes Biométricos, Rendimiento).
// 2. Filtrar por semana productiva o fechas específicas.
// 3. Fabricar el PDF y abrirlo de inmediato para WhatsApp o descarga.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/services/reporte_service.dart';
import 'package:app_movil/screens/pdf_viewer_screen.dart';
import 'package:app_movil/utils/calendario_util.dart';

class ReporteDialog extends StatefulWidget {
  final List<RegistroDiario> registros;
  final List<PesajeBiometrico> pesajes;
  final List<ProduccionHuevos> posturas;
  final List<Lote> lotes;
  final List<Galpon> galpones;
  final List<Operario> operarios;

  const ReporteDialog({
    super.key,
    required this.registros,
    required this.pesajes,
    required this.posturas,
    required this.lotes,
    required this.galpones,
    required this.operarios,
  });

  @override
  State<ReporteDialog> createState() => _ReporteDialogState();
}

class _ReporteDialogState extends State<ReporteDialog> {
  String _moduloSeleccionado = 'GENERAL';
  late final TextEditingController _semanaController;
  DateTimeRange? _rangoFechas;
  bool _generando = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    final semActual = CalendarioUtil.obtenerSemanaUS(now);
    _semanaController = TextEditingController(text: 'Semana #$semActual');
  }

  @override
  void dispose() {
    _semanaController.dispose();
    super.dispose();
  }

  Future<void> _abrirSelectorRangoFechas() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 1),
      initialDateRange: _rangoFechas ?? DateTimeRange(
        start: now.subtract(const Duration(days: 7)),
        end: now,
      ),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF33691E),
              onPrimary: Colors.white,
              onSurface: Color(0xFF1B5E20),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _rangoFechas = picked;
        final fInicio = DateFormat('dd/MM/yyyy').format(picked.start);
        final fFin = DateFormat('dd/MM/yyyy').format(picked.end);
        _semanaController.text = '$fInicio - $fFin';
      });
    }
  }

  Future<void> _generarReporte() async {
    setState(() => _generando = true);
    try {
      final modulo = _moduloSeleccionado;
      final semanaTexto = _semanaController.text.trim();
      final nombreArchivo = 'SIGA_Reporte_${modulo}_${DateFormat('yyyyMMdd_HHmm').format(DateTime.now())}.pdf';

      final generador = () => ReporteService.generarPdfReporte(
        registros: widget.registros,
        pesajes: widget.pesajes,
        posturas: widget.posturas,
        lotes: widget.lotes,
        galpones: widget.galpones,
        operarios: widget.operarios,
        modulo: modulo,
        semana: semanaTexto,
        rangoFechas: _rangoFechas != null
            ? '${DateFormat('dd/MM/yyyy').format(_rangoFechas!.start)} al ${DateFormat('dd/MM/yyyy').format(_rangoFechas!.end)}'
            : null,
      );

      if (!mounted) return;
      Navigator.pop(context); // Cerrar diálogo

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => PdfViewerScreen(
            titulo: 'Planilla Oficial - $modulo',
            generadorPdf: generador,
            nombreArchivo: nombreArchivo,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al preparar reporte: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _generando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 480,
        padding: const EdgeInsets.all(22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCEDC8),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.picture_as_pdf, color: Color(0xFF33691E)),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Imprimir Planilla Oficial', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF33691E))),
                      Text('Generación en formato PDF membretado', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 18),
            const Text('MÓDULO TÉCNICO', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF33691E))),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _moduloSeleccionado,
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
              items: const [
                DropdownMenuItem(value: 'GENERAL', child: Text('Seguimiento Diario (Mortalidad/Consumos)')),
                DropdownMenuItem(value: 'HUEVOS', child: Text('Producción de Huevos por Calibre')),
                DropdownMenuItem(value: 'BIOMETRIA', child: Text('Pesaje Biométrico y Curvas')),
                DropdownMenuItem(value: 'TODOS', child: Text('Planilla Integral Completa')),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _moduloSeleccionado = val);
              },
            ),
            const SizedBox(height: 16),
            const Text('PERÍODO O SEMANA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF33691E))),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _semanaController,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.calendar_month, color: Color(0xFF7CB342)),
                  tooltip: 'Seleccionar rango de fechas',
                  onPressed: _abrirSelectorRangoFechas,
                ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: _generando
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.visibility),
              label: Text(_generando ? 'Generando...' : 'Previsualizar y Compartir'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7CB342),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: _generando ? null : _generarReporte,
            ),
          ],
        ),
      ),
    );
  }
}
