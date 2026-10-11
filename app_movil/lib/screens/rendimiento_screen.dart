// ============================================================================
// ARCHIVO: app_movil/lib/screens/rendimiento_screen.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es EL PODIO DE MEDALLAS Y RANKING DE RENDIMIENTO DE GALPONES.
//
// Equivalente al "Ranking y Podio de Medallas" del Proyecto Siembras.
// Premia y reconoce a los mejores galpones según:
// 1. Índice de Eficiencia Productiva (IEP) en Engorde.
// 2. Porcentaje de Postura Semanal en Ponedoras.
// 3. Conversión Alimenticia (quién gastó menos alimento por kilo ganado).
// ============================================================================

import 'package:flutter/material.dart';

class RendimientoScreen extends StatelessWidget {
  const RendimientoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FBE7),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7CB342),
        elevation: 2,
        title: const Text(
          'Podio de Rendimiento Avícola',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Podio de Medallas Visual
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFC5E1A5)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                children: [
                  const Text(
                    '🏆 Cuadro de Honor de Galpones',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF33691E)),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      // 2do Lugar (Plata)
                      _PodioPilar(
                        puesto: 2,
                        galpon: 'Galpón 2',
                        lote: 'Ross 308',
                        score: 'IEP 368',
                        altura: 85,
                        color: const Color(0xFF90A4AE),
                        medalla: '🥈',
                      ),
                      // 1er Lugar (Oro)
                      _PodioPilar(
                        puesto: 1,
                        galpon: 'Galpón 1',
                        lote: 'Cobb 500',
                        score: 'IEP 374',
                        altura: 115,
                        color: const Color(0xFFFFA000),
                        medalla: '🥇',
                      ),
                      // 3er Lugar (Bronce)
                      _PodioPilar(
                        puesto: 3,
                        galpon: 'Galpón 3',
                        lote: 'Lohmann',
                        score: '96.2%',
                        altura: 65,
                        color: const Color(0xFF8D6E63),
                        medalla: '🥉',
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Lista detallada de posiciones
            Card(
              elevation: 1.5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: const BorderSide(color: Color(0xFFC5E1A5)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Tabla General de Productividad Zootécnica',
                      style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF33691E), fontSize: 13),
                    ),
                    const Divider(height: 20),
                    _ItemRanking(
                      num: '1',
                      nombre: 'Galpón 1 (Túnel Dinámico)',
                      lote: 'LOTE-ENG-2026-04 • Cobb 500',
                      iep: '374 IEP',
                      ca: '1.52 CA',
                      colorMedalla: const Color(0xFFFFA000),
                    ),
                    const Divider(height: 16),
                    _ItemRanking(
                      num: '2',
                      nombre: 'Galpón 2 (Túnel Dinámico)',
                      lote: 'LOTE-ENG-2026-05 • Ross 308',
                      iep: '368 IEP',
                      ca: '1.54 CA',
                      colorMedalla: const Color(0xFF90A4AE),
                    ),
                    const Divider(height: 16),
                    _ItemRanking(
                      num: '3',
                      nombre: 'Galpón 3 (Aviario Automatizado)',
                      lote: 'LOTE-PON-2025-11 • Lohmann Brown',
                      iep: '96.2% Post.',
                      ca: '1.88 kg/doc',
                      colorMedalla: const Color(0xFF8D6E63),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PodioPilar extends StatelessWidget {
  final int puesto;
  final String galpon;
  final String lote;
  final String score;
  final double altura;
  final Color color;
  final String medalla;

  const _PodioPilar({
    required this.puesto,
    required this.galpon,
    required this.lote,
    required this.score,
    required this.altura,
    required this.color,
    required this.medalla,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(medalla, style: const TextStyle(fontSize: 26)),
        const SizedBox(height: 2),
        Text(galpon, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        Text(score, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: color)),
        const SizedBox(height: 6),
        Container(
          width: 72,
          height: altura,
          decoration: BoxDecoration(
            color: color.withOpacity(0.18),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            border: Border.all(color: color, width: 1.5),
          ),
          child: Center(
            child: Text(
              '#$puesto',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color),
            ),
          ),
        ),
      ],
    );
  }
}

class _ItemRanking extends StatelessWidget {
  final String num;
  final String nombre;
  final String lote;
  final String iep;
  final String ca;
  final Color colorMedalla;

  const _ItemRanking({
    required this.num,
    required this.nombre,
    required this.lote,
    required this.iep,
    required this.ca,
    required this.colorMedalla,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 14,
          backgroundColor: colorMedalla,
          child: Text(num, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(nombre, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              Text(lote, style: TextStyle(color: Colors.grey.shade600, fontSize: 11)),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(iep, style: TextStyle(fontWeight: FontWeight.w900, color: colorMedalla, fontSize: 13)),
            Text(ca, style: TextStyle(color: Colors.grey.shade700, fontSize: 10.5)),
          ],
        ),
      ],
    );
  }
}
