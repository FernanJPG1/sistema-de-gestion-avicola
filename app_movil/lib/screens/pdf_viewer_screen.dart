import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:printing/printing.dart';
import 'package:app_movil/services/reporte_service.dart';

class PdfViewerScreen extends StatefulWidget {
  final String titulo;
  final Future<Uint8List> Function() generadorPdf;
  final String nombreArchivo;

  const PdfViewerScreen({
    super.key,
    required this.titulo,
    required this.generadorPdf,
    required this.nombreArchivo,
  });

  @override
  State<PdfViewerScreen> createState() => _PdfViewerScreenState();
}

class _PdfViewerScreenState extends State<PdfViewerScreen> {
  bool _guardando = false;

  Future<void> _guardar() async {
    setState(() => _guardando = true);
    try {
      final bytes = await widget.generadorPdf();
      final ruta = await ReporteService.guardarPdfEnDescargas(
        bytes: bytes,
        nombreArchivo: widget.nombreArchivo,
      );
      if (!mounted) return;
      if (ruta != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ Archivo guardado con éxito en Descargas:\n${widget.nombreArchivo}'),
            backgroundColor: const Color(0xFF2E7D32),
            duration: const Duration(seconds: 4),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('⚠️ No se pudo guardar en Descargas automáticamente.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al guardar: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _guardando = false);
    }
  }

  Future<void> _compartirWhatsApp() async {
    try {
      final bytes = await widget.generadorPdf();
      await ReporteService.compartirPdf(bytes: bytes, nombreArchivo: widget.nombreArchivo);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al compartir: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.titulo, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF33691E),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Color(0xFF81C784)),
            tooltip: 'Compartir por WhatsApp',
            onPressed: _compartirWhatsApp,
          ),
          IconButton(
            icon: _guardando
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Icon(Icons.download),
            tooltip: 'Guardar en Descargas',
            onPressed: _guardando ? null : _guardar,
          ),
        ],
      ),
      body: PdfPreview(
        build: (format) => widget.generadorPdf(),
        allowPrinting: true,
        allowSharing: true,
        canChangeOrientation: false,
        canChangePageFormat: false,
        pdfFileName: widget.nombreArchivo,
      ),
    );
  }
}
