// ============================================================================
// ARCHIVO: app_movil/lib/utils/calendario_util.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es el reloj y el calendario oficial del galpón.
//
// Tiene una regla de oro fundamental del sistema:
// "LA REGLA DEL CANDADO DE 48 HORAS":
// Si un operario anota un dato hoy o ayer, puede corregirlo o borrarlo en el celular.
// Pero si ya pasaron más de 2 días (48 horas), el registro se bloquea con un
// candado dorado. A partir de ahí, solo el administrador central en la oficina puede cambiarlo.
// ============================================================================

import 'package:intl/intl.dart';

class CalendarioUtil {
  /// Determina si un registro puede ser editado o eliminado en el móvil (dentro de las 48 horas)
  static bool puedeModificarRegistroPorFecha(String fechaString) {
    try {
      final fechaLimpia = fechaString.split('T')[0];
      final partes = fechaLimpia.split('-');
      if (partes.length < 3) return true;

      final ano = int.parse(partes[0]);
      final mes = int.parse(partes[1]);
      final dia = int.parse(partes[2]);

      final fechaReg = DateTime(ano, mes, dia);
      final ahora = DateTime.now();
      final hoy = DateTime(ahora.year, ahora.month, ahora.day);

      final diferenciaDias = hoy.difference(fechaReg).inDays;
      return diferenciaDias <= 2;
    } catch (_) {
      return true;
    }
  }

  /// Formatea una fecha para vista amigable (ej: "15 Oct 2026")
  static String formatearFecha(DateTime fecha) {
    return DateFormat('dd MMM yyyy', 'es_ES').format(fecha);
  }

  /// Retorna la fecha de hoy en formato ISO (YYYY-MM-DD)
  static String fechaHoyIso() {
    final now = DateTime.now();
    return "${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
  }
}
