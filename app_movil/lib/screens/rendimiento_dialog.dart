// ============================================================================
// ARCHIVO: rendimiento_dialog.dart
// ¿QUÉ ES ESTA VENTANA EXPLICADA DE FORMA SENCILLA?
// Es el cuaderno de premiación y evaluación zootécnica de los galponeros.
//
// Muestra el podio oficial de rendimiento:
// 1. 🥇 Medalla de Oro, 🥈 Plata y 🥉 Bronce según el IEP (Índice de Eficiencia Productiva)
//    y menor Conversión Alimenticia (mayor aprovechamiento del alimento).
// 2. Control de mortalidad acumulada.
// 3. Indicadores claros para felicitar a los mejores operarios de la granja.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:app_movil/models/entidades.dart';

class RendimientoDialog extends StatelessWidget {
  final List<RendimientoGalpon> rendimientos;

  const RendimientoDialog({super.key, required this.rendimientos});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 550,
        height: 600,
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text('🏆', style: TextStyle(fontSize: 24)),
                    SizedBox(width: 8),
                    Text(
                      'Podio de Rendimiento Zootécnico',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF33691E)),
                    ),
                  ],
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Evaluación por IEP, Conversión Alimenticia (CA) y Viabilidad del Lote',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: rendimientos.isEmpty
                  ? const Center(child: Text('No hay registros de rendimiento disponibles.'))
                  : ListView.builder(
                      itemCount: rendimientos.length,
                      itemBuilder: (ctx, i) {
                        final item = rendimientos[i];
                        final medalla = item.medalla;
                        return Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          elevation: i < 3 ? 3 : 1,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: i == 0
                                  ? const Color(0xFFFFD700)
                                  : i == 1
                                      ? const Color(0xFFC0C0C0)
                                      : i == 2
                                          ? const Color(0xFFCD7F32)
                                          : Colors.grey.shade300,
                              width: i < 3 ? 2 : 1,
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                Text(
                                  medalla ?? '#${i + 1}',
                                  style: TextStyle(
                                    fontSize: medalla != null ? 28 : 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.galpon.nombre,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                      ),
                                      Text(
                                        'Lote: ${item.lote?.codigoLote ?? "N/A"} (${item.lote?.tipoAve ?? "ENGORDE"})',
                                        style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          _buildBadge('IEP: ${item.iep.toStringAsFixed(1)}', const Color(0xFF2E7D32)),
                                          const SizedBox(width: 6),
                                          _buildBadge('CA: ${item.conversionAlimenticia.toStringAsFixed(2)}', const Color(0xFF1565C0)),
                                          const SizedBox(width: 6),
                                          _buildBadge('Mort: ${item.tasaMortalidad.toStringAsFixed(1)}%', Colors.red.shade700),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
      ),
    );
  }
}
