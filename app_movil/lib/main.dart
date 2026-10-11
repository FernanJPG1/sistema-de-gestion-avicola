// ============================================================================
// ARCHIVO: app_movil/lib/main.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es LA PUERTA PRINCIPAL Y EL INTERRUPTOR GENERAL de la aplicación móvil avícola.
//
// 1. Enciende los motores de Flutter.
// 2. Permite usar el celular en vertical u horizontal para ver tablas de galpón.
// 3. Abre la base de datos local SQLite y valida la integridad de los datos.
// 4. Activa el "Cinturón de Seguridad": si entra una llamada o el teléfono se apaga,
//    ejecuta el checkpoint para no perder ni un gramo de alimento ni un huevo anotado.
// ============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:app_movil/database/local_db.dart';
import 'package:app_movil/screens/dashboard_screen.dart';
import 'package:app_movil/widgets/firma_watermark.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Permite girar la pantalla libremente en campo
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  // Inicializar base de datos local
  await LocalDatabase.instance.database;

  runApp(const SigaApp());
}

class SigaApp extends StatefulWidget {
  const SigaApp({super.key});

  @override
  State<SigaApp> createState() => _SigaAppState();
}

class _SigaAppState extends State<SigaApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Si la app pasa a segundo plano o se apaga la pantalla, forzar persistencia inmediata
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.detached) {
      LocalDatabase.instance.checkpoint();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SIGA Enterprise Offline',
      theme: ThemeData(
        primaryColor: const Color(0xFF7CB342),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF7CB342)),
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      home: const DashboardScreen(),
      debugShowCheckedModeBanner: false,
      builder: (context, child) {
        return Stack(
          children: [
            child ?? const SizedBox.shrink(),
            const FirmaWatermark(
              width: 52.0,
              opacity: 0.22,
              left: 10.0,
              bottom: 10.0,
            ),
          ],
        );
      },
    );
  }
}
