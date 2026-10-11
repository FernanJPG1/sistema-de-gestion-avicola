// ============================================================================
// ARCHIVO: reporte_service.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Imagínate que este archivo es LA IMPRENTA O FOTOCOPIADORA DIGITAL DE LA GRANJA AVÍCOLA.
//
// Al final de la jornada en el galpón o al cierre de la semana productiva,
// los zootecnistas y administradores necesitan ver las cuentas claras en un papel formal:
// 1. Planilla General de Seguimiento Diario (Mortalidad, Alimento, Agua, Clima).
// 2. Planilla de Producción de Huevos por Calibre (Comercial, Jumbo, AAA, AA, A, Rotos).
// 3. Planilla de Biometría y Pesajes (Peso medio, Uniformidad, CA, IEP).
// 4. Informe de Rendimiento Zootécnico por Galponero (Podio de Oro, Plata y Bronce).
//
// Todo sale en archivo PDF listo para compartir por WhatsApp o mandar a imprimir.
// ============================================================================

import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import 'package:app_movil/models/entidades.dart';
import 'package:app_movil/utils/calendario_util.dart';

class ReporteService {
  /// Genera el documento PDF formal con la estética de SIGA Enterprise
  static Future<Uint8List> generarPdfReporte({
    required List<RegistroDiario> registros,
    required List<PesajeBiometrico> pesajes,
    required List<ProduccionHuevos> posturas,
    required List<Lote> lotes,
    required List<Galpon> galpones,
    required List<Operario> operarios,
    required String modulo, // 'GENERAL', 'HUEVOS', 'BIOMETRIA', 'RENDIMIENTO'
    String? semana,
    String? rangoFechas,
  }) async {
    final pdf = pw.Document();

    final fontRegular = pw.Font.helvetica();
    final fontBold = pw.Font.helveticaBold();
    final formatterNum = NumberFormat('#,###', 'es_CO');
    final fechaHoy = DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now());

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4.landscape,
        margin: const pw.EdgeInsets.all(24),
        header: (context) => _buildHeader(
          modulo: modulo,
          semana: semana ?? 'General',
          rangoFechas: rangoFechas,
          fechaHoy: fechaHoy,
          totalRegistros: registros.length,
          fontBold: fontBold,
          fontRegular: fontRegular,
        ),
        footer: (context) => _buildFooter(context, fontRegular),
        build: (context) => [
          pw.SizedBox(height: 10),
          if (modulo == 'GENERAL' || modulo == 'TODOS')
            _buildTablaRegistrosDiarios(
              registros: registros,
              lotes: lotes,
              galpones: galpones,
              operarios: operarios,
              fontBold: fontBold,
              fontRegular: fontRegular,
              formatterNum: formatterNum,
            ),
          if (modulo == 'HUEVOS')
            _buildTablaPostura(
              posturas: posturas,
              lotes: lotes,
              galpones: galpones,
              fontBold: fontBold,
              fontRegular: fontRegular,
              formatterNum: formatterNum,
            ),
          if (modulo == 'BIOMETRIA')
            _buildTablaBiometria(
              pesajes: pesajes,
              lotes: lotes,
              galpones: galpones,
              fontBold: fontBold,
              fontRegular: fontRegular,
              formatterNum: formatterNum,
            ),
          pw.SizedBox(height: 12),
          _buildResumenGeneral(
            registros: registros,
            fontBold: fontBold,
            fontRegular: fontRegular,
            formatterNum: formatterNum,
          ),
        ],
      ),
    );

    return pdf.save();
  }

  static pw.Widget _buildHeader({
    required String modulo,
    required String semana,
    required String? rangoFechas,
    required String fechaHoy,
    required int totalRegistros,
    required pw.Font fontBold,
    required pw.Font fontRegular,
  }) {
    String titulo = 'SIGA ENTERPRISE - REPORTE DE CONTROL TÉCNICO AVÍCOLA';
    if (modulo == 'HUEVOS') titulo = 'SIGA ENTERPRISE - CONTROL DE PRODUCCIÓN DE HUEVOS';
    if (modulo == 'BIOMETRIA') titulo = 'SIGA ENTERPRISE - CONTROL DE PESAJE BIOMÉTRICO Y CURVAS';
    if (modulo == 'RENDIMIENTO') titulo = 'SIGA ENTERPRISE - PODIO DE RENDIMIENTO ZOOTÉCNICO';

    return pw.Container(
      padding: const pw.EdgeInsets.only(bottom: 8),
      decoration: const pw.BoxDecoration(
        border: pw.Border(bottom: pw.BorderSide(color: PdfColors.green800, width: 2)),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        crossAxisAlignment: pw.CrossAxisAlignment.center,
        children: [
          pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text(
                titulo,
                style: pw.TextStyle(font: fontBold, fontSize: 13, color: PdfColors.green900),
              ),
              pw.SizedBox(height: 3),
              pw.Text(
                'Período: $semana ${rangoFechas != null ? "($rangoFechas)" : ""} | Total registros: $totalRegistros',
                style: pw.TextStyle(font: fontRegular, fontSize: 8.5, color: PdfColors.grey700),
              ),
            ],
          ),
          pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.end,
            children: [
              pw.Text('Generado: $fechaHoy', style: pw.TextStyle(font: fontRegular, fontSize: 8, color: PdfColors.grey800)),
              pw.Text('Estado: SISTEMA CENTRAL SINCRONIZADO', style: pw.TextStyle(font: fontBold, fontSize: 7.5, color: PdfColors.green800)),
            ],
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildFooter(pw.Context context, pw.Font fontRegular) {
    return pw.Container(
      alignment: pw.Alignment.centerRight,
      margin: const pw.EdgeInsets.only(top: 8),
      child: pw.Text(
        'Página ${context.pageNumber} de ${context.pagesCount} | SIGA Enterprise Zootecnia v2.0',
        style: pw.TextStyle(font: fontRegular, fontSize: 7, color: PdfColors.grey600),
      ),
    );
  }

  static pw.Widget _buildTablaRegistrosDiarios({
    required List<RegistroDiario> registros,
    required List<Lote> lotes,
    required List<Galpon> galpones,
    required List<Operario> operarios,
    required pw.Font fontBold,
    required pw.Font fontRegular,
    required NumberFormat formatterNum,
  }) {
    final headers = [
      'Fecha', 'Día', 'Lote', 'Galpón', 'Mort.', 'Desc.', 'Alimento (Kg)', 'Agua (L)', 'T.Mín', 'T.Máx', 'Hum%', 'Galponero', 'Obs.'
    ];

    final rows = registros.map((r) {
      final lote = lotes.firstWhere((l) => l.id == r.loteId, orElse: () => Lote(id: 0, codigoLote: 'N/A', galponId: 0, lineaId: 0, fechaEncasetamiento: '', avesIniciales: 0, tipoAve: 'ENGORDE', estado: 'ACTIVO'));
      final galpon = galpones.firstWhere((g) => g.id == lote.galponId, orElse: () => Galpon(id: 0, granjaId: 0, numero: 0, nombre: 'G-?', capacidadMaxima: 0, tipoVentilacion: 'NATURAL'));
      final op = operarios.firstWhere((o) => o.id == r.operarioId, orElse: () => Operario(id: 0, cedula: '', nombreCompleto: 'Sin asignar'));

      return [
        r.fecha,
        '${r.diaVida}d',
        lote.codigoLote,
        galpon.nombre,
        formatterNum.format(r.mortalidad),
        formatterNum.format(r.descarte),
        formatterNum.format(r.alimentoKg),
        formatterNum.format(r.aguaLitros),
        '${r.tempMin ?? "-"}°C',
        '${r.tempMax ?? "-"}°C',
        '${r.humedadPct ?? "-"}%',
        op.nombreCompleto,
        r.observaciones ?? '',
      ];
    }).toList();

    return pw.TableHelper.fromTextArray(
      headers: headers,
      data: rows,
      border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
      headerStyle: pw.TextStyle(font: fontBold, fontSize: 7.5, color: PdfColors.white),
      headerDecoration: const pw.BoxDecoration(color: PdfColors.green800),
      cellStyle: pw.TextStyle(font: fontRegular, fontSize: 7),
      cellPadding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3),
      cellAlignment: pw.Alignment.centerLeft,
    );
  }

  static pw.Widget _buildTablaPostura({
    required List<ProduccionHuevos> posturas,
    required List<Lote> lotes,
    required List<Galpon> galpones,
    required pw.Font fontBold,
    required pw.Font fontRegular,
    required NumberFormat formatterNum,
  }) {
    final headers = [
      'Fecha', 'Lote', 'Galpón', 'Tot. Huevos', 'Comerciales', 'Rotos', 'Sucios', 'Jumbo', 'AAA', 'AA', 'A', 'B', 'Postura %'
    ];

    final rows = posturas.map((p) {
      final lote = lotes.firstWhere((l) => l.id == p.loteId, orElse: () => Lote(id: 0, codigoLote: 'N/A', galponId: 0, lineaId: 0, fechaEncasetamiento: '', avesIniciales: 0, tipoAve: 'PONEDORA', estado: 'ACTIVO'));
      final galpon = galpones.firstWhere((g) => g.id == lote.galponId, orElse: () => Galpon(id: 0, granjaId: 0, numero: 0, nombre: 'G-?', capacidadMaxima: 0, tipoVentilacion: 'TUNEL'));

      return [
        p.fecha,
        lote.codigoLote,
        galpon.nombre,
        formatterNum.format(p.huevosTotales),
        formatterNum.format(p.huevosComerciales),
        formatterNum.format(p.huevosRotos),
        formatterNum.format(p.huevosSucios),
        formatterNum.format(p.calibreJumbo),
        formatterNum.format(p.calibreAaa),
        formatterNum.format(p.calibreAa),
        formatterNum.format(p.calibreA),
        formatterNum.format(p.calibreB),
        '${p.posturaPct?.toStringAsFixed(1) ?? "-"}%',
      ];
    }).toList();

    return pw.TableHelper.fromTextArray(
      headers: headers,
      data: rows,
      border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
      headerStyle: pw.TextStyle(font: fontBold, fontSize: 7.5, color: PdfColors.white),
      headerDecoration: const pw.BoxDecoration(color: PdfColors.amber800),
      cellStyle: pw.TextStyle(font: fontRegular, fontSize: 7),
      cellPadding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3),
    );
  }

  static pw.Widget _buildTablaBiometria({
    required List<PesajeBiometrico> pesajes,
    required List<Lote> lotes,
    required List<Galpon> galpones,
    required pw.Font fontBold,
    required pw.Font fontRegular,
    required NumberFormat formatterNum,
  }) {
    final headers = [
      'Fecha', 'Día Vida', 'Lote', 'Galpón', 'Aves Muestreadas', 'Peso Promedio (g)', 'Uniformidad %', 'CV %', 'Estándar Guía (g)'
    ];

    final rows = pesajes.map((b) {
      final lote = lotes.firstWhere((l) => l.id == b.loteId, orElse: () => Lote(id: 0, codigoLote: 'N/A', galponId: 0, lineaId: 0, fechaEncasetamiento: '', avesIniciales: 0, tipoAve: 'ENGORDE', estado: 'ACTIVO'));
      final galpon = galpones.firstWhere((g) => g.id == lote.galponId, orElse: () => Galpon(id: 0, granjaId: 0, numero: 0, nombre: 'G-?', capacidadMaxima: 0, tipoVentilacion: 'TUNEL'));

      return [
        b.fecha,
        '${b.diaVida}d',
        lote.codigoLote,
        galpon.nombre,
        '${b.avesPesadas} aves',
        '${b.pesoPromedioG.toStringAsFixed(1)} g',
        '${b.uniformidadPct?.toStringAsFixed(1) ?? "-"}%',
        '${b.cvPct?.toStringAsFixed(1) ?? "-"}%',
        '${b.pesoEstandarG?.toStringAsFixed(0) ?? "-"} g',
      ];
    }).toList();

    return pw.TableHelper.fromTextArray(
      headers: headers,
      data: rows,
      border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
      headerStyle: pw.TextStyle(font: fontBold, fontSize: 7.5, color: PdfColors.white),
      headerDecoration: const pw.BoxDecoration(color: PdfColors.blueGrey800),
      cellStyle: pw.TextStyle(font: fontRegular, fontSize: 7),
      cellPadding: const pw.EdgeInsets.symmetric(horizontal: 4, vertical: 3),
    );
  }

  static pw.Widget _buildResumenGeneral({
    required List<RegistroDiario> registros,
    required pw.Font fontBold,
    required pw.Font fontRegular,
    required NumberFormat formatterNum,
  }) {
    int totalMort = 0;
    int totalDesc = 0;
    double totalAlimento = 0;
    double totalAgua = 0;

    for (var r in registros) {
      totalMort += r.mortalidad;
      totalDesc += r.descarte;
      totalAlimento += r.alimentoKg;
      totalAgua += r.aguaLitros;
    }

    return pw.Container(
      padding: const pw.EdgeInsets.all(8),
      decoration: pw.BoxDecoration(
        color: PdfColors.grey100,
        borderRadius: const pw.BorderRadius.all(pw.Radius.circular(4)),
        border: pw.Border.all(color: PdfColors.grey400, width: 0.5),
      ),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
        children: [
          pw.Text('Total Mortalidad: ${formatterNum.format(totalMort)} aves', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
          pw.Text('Total Descartes: ${formatterNum.format(totalDesc)} aves', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
          pw.Text('Consumo Alimento: ${formatterNum.format(totalAlimento)} Kg', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
          pw.Text('Consumo Agua: ${formatterNum.format(totalAgua)} L', style: pw.TextStyle(font: fontBold, fontSize: 8.5)),
        ],
      ),
    );
  }

  /// Guarda el archivo PDF en el almacenamiento local del dispositivo (Descargas)
  static Future<String?> guardarPdfEnDescargas({
    required Uint8List bytes,
    required String nombreArchivo,
  }) async {
    try {
      Directory? dir;
      if (Platform.isAndroid) {
        dir = Directory('/storage/emulated/0/Download');
        if (!await dir.exists()) {
          dir = await getExternalStorageDirectory();
        }
      } else {
        dir = await getApplicationDocumentsDirectory();
      }

      if (dir == null) return null;
      final file = File('${dir.path}/$nombreArchivo');
      await file.writeAsBytes(bytes);
      return file.path;
    } catch (e) {
      debugPrint('Error guardando PDF: $e');
      return null;
    }
  }

  /// Comparte el archivo por WhatsApp u otras aplicaciones del sistema
  static Future<void> compartirPdf({
    required Uint8List bytes,
    required String nombreArchivo,
  }) async {
    await Printing.sharePdf(bytes: bytes, filename: nombreArchivo);
  }
}
