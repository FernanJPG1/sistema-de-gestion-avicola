import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:app_movil/models/entidades.dart';

void main() {
  test('Prueba de integridad y serialización de RegistroDiario para Respaldo Persistente', () {
    final reg = RegistroDiario(
      id: 1,
      uuid: 'reg-test-uuid-1234',
      loteId: 10,
      fecha: '2026-10-11',
      diaVida: 35,
      mortalidad: 15,
      descarte: 3,
      alimentoKg: 3400.0,
      aguaLitros: 5900.0,
      tempMin: 22.0,
      tempMax: 30.5,
      humedadPct: 62.0,
      observaciones: 'TEST OFFLINE PERSISTENCIA AVICOLA',
      operarioId: 5,
      createdAt: '2026-10-11T10:00:00',
      sincronizado: 0,
    );

    final map = reg.toMap();
    expect(map['uuid'], equals('reg-test-uuid-1234'));
    expect(map['sincronizado'], equals(0));
    expect(map['mortalidad'], equals(15));
    expect(map['alimento_kg'], equals(3400.0));

    final jsonStr = jsonEncode(map);
    final deserializado = jsonDecode(jsonStr);

    expect(deserializado['uuid'], equals('reg-test-uuid-1234'));
    expect(deserializado['dia_vida'], equals(35));
  });
}
