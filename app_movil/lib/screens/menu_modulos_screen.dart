// ============================================================================
// ARCHIVO: app_movil/lib/screens/menu_modulos_screen.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es EL MENÚ DE SELECCIÓN RÁPIDA DE OPERACIONES EN GALPÓN.
//
// Equivalente al "Menú de Cultivos" del Proyecto Siembras.
// Permite que el operario elija con un solo toque con el dedo qué va a registrar:
// 1. Pollos de Engorde (Consumo diario y mortalidad).
// 2. Gallinas Ponedoras (Recolección y clasificación de huevos).
// 3. Muestreo Biométrico (Pesaje muestral y cálculo de uniformidad).
// 4. Ranking Zootécnico (Podio de Medallas Oro, Plata, Bronce).
// 5. Buzón de Sincronización (Pendientes por subir al servidor).
// 6. Supervisión y Reportes PDF (Impresión y WhatsApp).
// ============================================================================

import 'package:flutter/material.dart';
import 'package:app_movil/screens/form_registro_campo_screen.dart';
import 'package:app_movil/screens/form_produccion_huevos_screen.dart';
import 'package:app_movil/screens/form_pesaje_biometrico_screen.dart';
import 'package:app_movil/screens/rendimiento_screen.dart';
import 'package:app_movil/screens/historial_screen.dart';
import 'package:app_movil/screens/admin_panel_hub_screen.dart';

class MenuModulosScreen extends StatelessWidget {
  const MenuModulosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FBE7),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7CB342),
        elevation: 2,
        title: const Text(
          'Módulos de Operación Avícola',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Selecciona el área de trabajo en campo:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Color(0xFF33691E),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 14,
                mainAxisSpacing: 14,
                childAspectRatio: 1.1,
                children: [
                  _ModuloTile(
                    title: 'Pollos de Engorde',
                    subtitle: 'Mortalidad y Alimento',
                    icon: Icons.pets,
                    color: const Color(0xFF7CB342),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const FormRegistroCampoScreen(tipo: 'ENGORDE'),
                        ),
                      );
                    },
                  ),
                  _ModuloTile(
                    title: 'Gallinas Ponedoras',
                    subtitle: 'Postura y Recolección',
                    icon: Icons.egg_outlined,
                    color: const Color(0xFFFFA000),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const FormProduccionHuevosScreen(),
                        ),
                      );
                    },
                  ),
                  _ModuloTile(
                    title: 'Muestreo de Pesaje',
                    subtitle: 'Biometría y Uniformidad',
                    icon: Icons.scale_outlined,
                    color: const Color(0xFF33691E),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const FormPesajeBiometricoScreen(),
                        ),
                      );
                    },
                  ),
                  _ModuloTile(
                    title: 'Ranking de Galpones',
                    subtitle: 'Podio y Rendimiento',
                    icon: Icons.emoji_events_outlined,
                    color: const Color(0xFF0288D1),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const RendimientoScreen(),
                        ),
                      );
                    },
                  ),
                  _ModuloTile(
                    title: 'Buzón de Salida',
                    subtitle: 'Pendientes Sync y 48h',
                    icon: Icons.outbox,
                    color: const Color(0xFF5D4037),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const HistorialScreen(),
                        ),
                      );
                    },
                  ),
                  _ModuloTile(
                    title: 'Supervisión y PDF',
                    subtitle: 'Reportes y Servidor',
                    icon: Icons.picture_as_pdf,
                    color: const Color(0xFFC2185B),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const AdminPanelHubScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ModuloTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ModuloTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.35), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.12),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 26,
              backgroundColor: color.withValues(alpha: 0.12),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 10.5,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
