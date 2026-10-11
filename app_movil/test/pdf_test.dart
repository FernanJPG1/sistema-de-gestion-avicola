import 'package:flutter_test/flutter_test.dart';
import 'package:app_movil/services/reporte_service.dart';
import 'package:app_movil/models/entidades.dart';

void main() {
  test('Test generarPdfReporte avicola con metricas zootecnicas', () async {
    TestWidgetsFlutterBinding.ensureInitialized();
    final bytes = await ReporteService.generarPdfReporte(
      registros: [
        RegistroDiario(
          id: 1,
          uuid: 'test-uuid-001',
          loteId: 1,
          fecha: '2026-10-11',
          diaVida: 32,
          mortalidad: 12,
          descarte: 2,
          alimentoKg: 3200.0,
          aguaLitros: 5600.0,
          tempMin: 22.0,
          tempMax: 30.5,
          humedadPct: 65.0,
          observaciones: 'Lote en perfecto estado zoosanitario.',
          operarioId: 1,
          createdAt: '2026-10-11T10:00:00',
          sincronizado: 0,
        ),
      ],
      pesajes: [
        PesajeBiometrico(
          id: 1,
          uuid: 'test-pes-001',
          loteId: 1,
          fecha: '2026-10-11',
          diaVida: 32,
          avesPesadas: 100,
          pesoPromedioG: 1950.0,
          uniformidadPct: 88.5,
          cvPct: 8.2,
          pesoEstandarG: 1980.0,
          observaciones: 'Buena conformacion de pechuga',
          createdAt: '2026-10-11T10:00:00',
          sincronizado: 0,
        ),
      ],
      posturas: [
        ProduccionHuevos(
          id: 1,
          uuid: 'test-post-001',
          loteId: 2,
          fecha: '2026-10-11',
          huevosTotales: 9200,
          huevosComerciales: 9150,
          huevosRotos: 30,
          huevosSucios: 20,
          calibreJumbo: 600,
          calibreAaa: 3200,
          calibreAa: 4100,
          calibreA: 1100,
          calibreB: 150,
          posturaPct: 92.0,
          createdAt: '2026-10-11T10:00:00',
          sincronizado: 0,
        ),
      ],
      lotes: [
        Lote(
          id: 1,
          codigoLote: 'ENG-2026-01',
          galponId: 1,
          lineaId: 1,
          fechaEncasetamiento: '2026-09-09',
          avesIniciales: 25000,
          cantidadActual: 24700,
          tipoAve: 'ENGORDE',
          estado: 'ACTIVO',
        ),
        Lote(
          id: 2,
          codigoLote: 'PON-2026-01',
          galponId: 2,
          lineaId: 2,
          fechaEncasetamiento: '2026-03-01',
          avesIniciales: 10000,
          cantidadActual: 9850,
          tipoAve: 'PONEDORA',
          estado: 'ACTIVO',
        ),
      ],
      galpones: [
        Galpon(id: 1, granjaId: 1, numero: 1, nombre: 'Galpón 1 (Túnel)', capacidadMaxima: 26000, tipoVentilacion: 'TUNEL'),
        Galpon(id: 2, granjaId: 1, numero: 2, nombre: 'Galpón 2 (Aviario)', capacidadMaxima: 12000, tipoVentilacion: 'NATURAL'),
      ],
      operarios: [
        Operario(id: 1, cedula: '10203040', nombreCompleto: 'Juan Valderrama'),
      ],
      modulo: 'GENERAL',
    );

    expect(bytes, isNotNull);
    expect(bytes.isNotEmpty, isTrue);
  });
}
