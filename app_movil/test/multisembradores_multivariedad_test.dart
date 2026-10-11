import 'package:flutter_test/flutter_test.dart';
import 'package:app_movil/models/entidades.dart';

void main() {
  group('Pruebas de Validación Zootécnica y Rendimiento de Galpones Avícolas', () {
    test('Cálculo correcto de IEP y Conversión Alimenticia', () {
      final galpon = Galpon(
        id: 1,
        granjaId: 1,
        numero: 1,
        nombre: 'Galpón 1 (Túnel)',
        capacidadMaxima: 25000,
        tipoVentilacion: 'TUNEL',
      );

      final lote = Lote(
        id: 1,
        codigoLote: 'ENG-2026-01',
        galponId: 1,
        lineaId: 1,
        fechaEncasetamiento: '2026-09-01',
        avesIniciales: 25000,
        cantidadActual: 24200,
        tipoAve: 'ENGORDE',
        estado: 'ACTIVO',
      );

      final ranking = RendimientoGalpon.calcular(
        galpones: [galpon],
        lotes: [lote],
      );

      expect(ranking.length, 1);
      final r = ranking.first;
      expect(r.medalla, '🥇');
      expect(r.tasaMortalidad, greaterThan(0));
      expect(r.iep, greaterThan(250));
    });
  });
}
