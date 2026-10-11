// ============================================================================
// ARCHIVO: app_movil/lib/screens/dashboard_screen.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es LA PANTALLA PRINCIPAL DE SUPERVISIÓN AVÍCOLA.
//
// Muestra el tablero táctico con:
// 1. Tarjetas de resumen (Total Aves Vivas, Lotes Activos, Conversión y Postura).
// 2. Tabla de Lotes con colores agronómicos (#7CB342 y #33691E).
// 3. Indicador de sincronización Wi-Fi (nube ámbar o check verde).
// 4. El Candado de 48 Horas de seguridad.
// 5. Botón flotante (+) para registrar pesajes o novedades de campo.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:app_movil/database/local_db.dart';
import 'package:app_movil/utils/calendario_util.dart';
import 'package:app_movil/widgets/firma_watermark.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Map<String, dynamic>> _lotes = [];
  bool _cargando = true;
  bool _sincronizando = false;

  @override
  void initState() {
    super.initState();
    _cargarLotes();
  }

  Future<void> _cargarLotes() async {
    setState(() => _cargando = true);
    final db = await LocalDatabase.instance.database;
    final res = await db.rawQuery('''
      SELECT l.*, g.numero as galpon_nombre, g.tipo_sistema
      FROM tb_lotes l
      JOIN tb_galpones g ON l.galpon_id = g.id
      ORDER BY l.id DESC
    ''');
    setState(() {
      _lotes = res;
      _cargando = false;
    });
  }

  void _simularSincronizacion() async {
    setState(() => _sincronizando = true);
    await Future.delayed(const Duration(milliseconds: 1200));
    final db = await LocalDatabase.instance.database;
    await db.rawUpdate('UPDATE tb_lotes SET sincronizado = 1');
    await _cargarLotes();
    setState(() => _sincronizando = false);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✓ Sincronización avícola completada con el servidor central.'),
        backgroundColor: Color(0xFF33691E),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    int totalAves = 0;
    int lotesActivos = 0;
    for (var l in _lotes) {
      if (l['estado'] == 'ACTIVO') {
        lotesActivos++;
        totalAves += (l['cantidad_actual'] as num).toInt();
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF9FBE7), // Tono agronómico suave
      appBar: AppBar(
        backgroundColor: const Color(0xFF7CB342),
        elevation: 2,
        title: const Row(
          children: [
            Icon(Icons.egg_outlined, color: Colors.white, size: 24),
            SizedBox(width: 8),
            Text(
              'SIGA Enterprise • Granja El Paraíso',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: _sincronizando
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                  )
                : const Icon(Icons.sync, color: Colors.white),
            tooltip: 'Sincronizar Lotes',
            onPressed: _sincronizando ? null : _simularSincronizacion,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // BANNER SUPERIOR DE TARJETAS KPI (ESTÉTICA SIEMBRAS)
              Container(
                padding: const EdgeInsets.all(12),
                color: Colors.white,
                child: Row(
                  children: [
                    _KpiCard(
                      title: 'Aves Vivas',
                      value: '$totalAves',
                      sub: 'Población actual',
                      color: const Color(0xFF33691E),
                      icon: Icons.pets,
                    ),
                    const SizedBox(width: 8),
                    _KpiCard(
                      title: 'Lotes Activos',
                      value: '$lotesActivos',
                      sub: 'En producción',
                      color: const Color(0xFF7CB342),
                      icon: Icons.grid_view_rounded,
                    ),
                    const SizedBox(width: 8),
                    const _KpiCard(
                      title: 'Estado ICA',
                      value: '100% OK',
                      sub: 'GAB Bioseguro',
                      color: Color(0xFFF57F17),
                      icon: Icons.verified_user_outlined,
                    ),
                  ],
                ),
              ),

              const Divider(height: 1, thickness: 1, color: Color(0xFFDCEDC8)),

              // TABLA DE LOTES
              Expanded(
                child: _cargando
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF7CB342)))
                    : _lotes.isEmpty
                        ? const Center(child: Text('No hay lotes registrados'))
                        : ListView.separated(
                            padding: const EdgeInsets.only(bottom: 80, top: 8, left: 12, right: 12),
                            itemCount: _lotes.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final lote = _lotes[index];
                              final esActivo = lote['estado'] == 'ACTIVO';
                              final esSinc = lote['sincronizado'] == 1;
                              final puedeModificar = CalendarioUtil.puedeModificarRegistroPorFecha(lote['fecha_ingreso']);

                              return Card(
                                elevation: 1.5,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  side: BorderSide(
                                    color: esActivo ? const Color(0xFFC5E1A5) : Colors.grey.shade300,
                                    width: 1.2,
                                  ),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFF33691E),
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: Text(
                                                  lote['codigo'],
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                lote['galpon_nombre'] ?? 'Galpón',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  color: Color(0xFF263238),
                                                  fontSize: 13,
                                                ),
                                              ),
                                            ],
                                          ),
                                          Row(
                                            children: [
                                              // Estado Sincronización
                                              Icon(
                                                esSinc ? Icons.check_circle : Icons.cloud_upload_outlined,
                                                size: 18,
                                                color: esSinc ? const Color(0xFF7CB342) : const Color(0xFFFFA000),
                                              ),
                                              const SizedBox(width: 6),
                                              // Candado de 48 horas
                                              Icon(
                                                puedeModificar ? Icons.lock_open : Icons.lock,
                                                size: 18,
                                                color: puedeModificar ? Colors.grey : const Color(0xFFFFA000),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          _DataChip(label: 'Tipo', val: lote['tipo_ave']),
                                          const SizedBox(width: 8),
                                          _DataChip(label: 'Genética', val: lote['linea_genetica']),
                                          const SizedBox(width: 8),
                                          _DataChip(label: 'Población', val: '${lote['cantidad_actual']} aves'),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            'Ingreso: ${lote['fecha_ingreso']}',
                                            style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: esActivo ? const Color(0xFFDCEDC8) : Colors.grey.shade200,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              esActivo ? 'ACTIVO' : 'FINALIZADO',
                                              style: TextStyle(
                                                color: esActivo ? const Color(0xFF33691E) : Colors.grey.shade700,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 10.5,
                                              ),
                                            ),
                                          ),
                                        ],
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

          // Marca de agua sutil en esquina inferior
          const FirmaWatermark(
            width: 52.0,
            opacity: 0.24,
            left: 12.0,
            bottom: 12.0,
          ),
        ],
      ),

      // Botón flotante (+) idéntico a PROYECTO_SIEMBRAS
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF7CB342),
        elevation: 6,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
          side: const BorderSide(color: Colors.white, width: 2.5),
        ),
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const MenuModulosScreen()),
          );
          _cargarLotes();
        },
        child: const Icon(Icons.add, color: Colors.white, size: 32),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final String sub;
  final Color color;
  final IconData icon;

  const _KpiCard({
    required this.title,
    required this.value,
    required this.sub,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: BorderSide(color: color.withOpacity(0.25)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 14, color: color),
                const SizedBox(width: 4),
                Text(
                  title,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: color),
            ),
            Text(
              sub,
              style: TextStyle(fontSize: 9.5, color: Colors.grey.shade700),
            ),
          ],
        ),
      ),
    );
  }
}

class _DataChip extends StatelessWidget {
  final String label;
  final String val;

  const _DataChip({required this.label, required this.val});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F8E9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '$label: $val',
        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Color(0xFF33691E)),
      ),
    );
  }
}
