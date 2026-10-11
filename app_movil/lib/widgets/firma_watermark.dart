import 'package:flutter/material.dart';

/// Marca de agua / firma sutil del sistema avícola SIGA Enterprise
/// Diseñado para flotar en la esquina izquierda de forma muy leve y sin bloquear interacciones táctiles.
class FirmaWatermark extends StatelessWidget {
  final double width;
  final double opacity;
  final double left;
  final double bottom;

  const FirmaWatermark({
    super.key,
    this.width = 54.0,
    this.opacity = 0.22,
    this.left = 12.0,
    this.bottom = 12.0,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: left,
      bottom: bottom,
      child: IgnorePointer(
        child: Opacity(
          opacity: opacity,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: const Color(0xFF7CB342),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Center(
                  child: Text(
                    'S',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'SIGA Enterprise',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF33691E),
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
