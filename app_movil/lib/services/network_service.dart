// ============================================================================
// ARCHIVO: network_service.dart
// ¿QUÉ ES ESTE ARCHIVO EXPLICADO DE FORMA SENCILLA?
// Es el vigía o centinela que está mirando constantemente si el teléfono tiene internet o Wi-Fi.
//
// Cuando el galponero sale del galpón hacia la administración y el teléfono se conecta al Wi-Fi,
// este servicio despierta de inmediato al mensajero (`SyncService`) para que suba
// todos los datos pendientes sin que el operario tenga que acordarse de presionar nada.
// ============================================================================

import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class NetworkService {
  final Connectivity _connectivity = Connectivity();
  late StreamSubscription<List<ConnectivityResult>> _subscription;

  final Function onNetworkRestored;

  NetworkService({required this.onNetworkRestored}) {
    _iniciarEscucha();
  }

  void _iniciarEscucha() {
    _subscription = _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      // Ignorar si no hay conexión
      if (results.contains(ConnectivityResult.none)) {
        return;
      }

      // Si hay conexión móvil o wifi, avisamos al callback
      if (results.contains(ConnectivityResult.mobile) ||
          results.contains(ConnectivityResult.wifi)) {
        onNetworkRestored();
      }
    });
  }

  void dispose() {
    _subscription.cancel();
  }

  Future<bool> hasInternet() async {
    final results = await _connectivity.checkConnectivity();
    return !results.contains(ConnectivityResult.none);
  }
}
