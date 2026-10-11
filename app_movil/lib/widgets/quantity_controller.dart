import 'package:flutter/material.dart';

class QuantityController extends StatelessWidget {
  final String label;
  final int quantity;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;
  final List<int> quickSteps;

  const QuantityController({
    super.key,
    required this.label,
    required this.quantity,
    required this.onChanged,
    this.min = 0,
    this.max = 999999,
    this.quickSteps = const [1, 10, 50, 100],
  });

  void _adjust(int delta) {
    final next = (quantity + delta).clamp(min, max);
    onChanged(next);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF7CB342), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF33691E),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildBtn(Icons.remove, () => _adjust(-quickSteps.first), color: Colors.red.shade700),
              Expanded(
                child: Text(
                  quantity.toString(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1B5E20),
                  ),
                ),
              ),
              _buildBtn(Icons.add, () => _adjust(quickSteps.first), color: const Color(0xFF2E7D32)),
            ],
          ),
          const SizedBox(height: 8),
          // Botones de incremento rápido
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 6,
            runSpacing: 4,
            children: quickSteps.skip(1).map((step) {
              return ActionChip(
                label: Text('+$step', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                backgroundColor: const Color(0xFFF1F8E9),
                side: const BorderSide(color: Color(0xFFAED581)),
                onPressed: () => _adjust(step),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildBtn(IconData icon, VoidCallback onTap, {required Color color}) {
    return Material(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          alignment: Alignment.center,
          child: Icon(icon, color: color, size: 24),
        ),
      ),
    );
  }
}
