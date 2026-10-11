// ============================================================================
// 🐔 ARCHIVO: seed_data.dart (SEMILLAS INICIALES OFICIALES DE LA GRANJA)
// ============================================================================
// Contiene el catálogo oficial de granjas, galpones, líneas genéticas, operarios
// y lotes iniciales para que la aplicación funcione 100% desconectada de inmediato.
// ============================================================================

const List<Map<String, dynamic>> kSeedGranjas = [
  {
    'id': 1,
    'codigo': 'GRA-01',
    'nombre': 'Granja Matriz El Paraíso',
    'registro_ica': 'ICA-GAB-004821',
    'municipio': 'Fusagasugá',
    'departamento': 'Cundinamarca',
    'capacidad_total': 85000,
  },
  {
    'id': 2,
    'codigo': 'GRA-02',
    'nombre': 'Granja La Colina Biosegura',
    'registro_ica': 'ICA-GAB-005119',
    'municipio': 'Silvania',
    'departamento': 'Cundinamarca',
    'capacidad_total': 65000,
  },
];

const List<Map<String, dynamic>> kSeedGalpones = [
  {
    'id': 1,
    'granja_id': 1,
    'numero': 'Galpón 01 (Túnel Dinámico)',
    'tipo_sistema': 'Túnel Presión Negativa',
    'area_m2': 1400.0,
    'capacidad_maxima': 22000,
    'estado': 'OCUPADO',
  },
  {
    'id': 2,
    'granja_id': 1,
    'numero': 'Galpón 02 (Ambiente Cortinas)',
    'tipo_sistema': 'Ambiente Natural con Cortinas',
    'area_m2': 1100.0,
    'capacidad_maxima': 15000,
    'estado': 'VACIO_SANITARIO',
  },
  {
    'id': 3,
    'granja_id': 1,
    'numero': 'Galpón 03 (Dark House Combi)',
    'tipo_sistema': 'Dark House Automatizado',
    'area_m2': 1750.0,
    'capacidad_maxima': 25000,
    'estado': 'OCUPADO',
  },
  {
    'id': 4,
    'granja_id': 1,
    'numero': 'Galpón 04 (Aviario Automatizado)',
    'tipo_sistema': 'Postura Piso Nido Auto',
    'area_m2': 1300.0,
    'capacidad_maxima': 14000,
    'estado': 'OCUPADO',
  },
  {
    'id': 5,
    'granja_id': 1,
    'numero': 'Galpón 05 (Pastoreo Free-Range)',
    'tipo_sistema': 'Pastoreo Libre y Nidal',
    'area_m2': 1500.0,
    'capacidad_maxima': 16000,
    'estado': 'DISPONIBLE',
  },
];

const List<Map<String, dynamic>> kSeedOperarios = [
  {'id': 1, 'cedula': '1014285941', 'nombre_completo': 'Carlos Rodríguez', 'cargo': 'Supervisor de Granja'},
  {'id': 2, 'cedula': '1023948572', 'nombre_completo': 'María Consuelo Pérez', 'cargo': 'Galponera Especialista'},
  {'id': 3, 'cedula': '80192847', 'nombre_completo': 'Dr. Jorge Hernán Mora', 'cargo': 'Médico Veterinario ICA'},
  {'id': 4, 'cedula': '1032481920', 'nombre_completo': 'Andrés Felipe Téllez', 'cargo': 'Galponero de Bioseguridad'},
  {'id': 5, 'cedula': '52194832', 'nombre_completo': 'Rosa Elena Gómez', 'cargo': 'Supervisora de Clasificación'},
];

const List<Map<String, dynamic>> kSeedLotes = [
  {
    'id': 1,
    'uuid': 'uuid-lote-engorde-01',
    'codigo': 'PE-2026-088',
    'galpon_id': 1,
    'tipo_ave': 'ENGORDE',
    'linea_genetica': 'Ross 308 AP',
    'fecha_ingreso': '2026-08-26',
    'edad_dias_inicial': 1,
    'cantidad_inicial': 18500,
    'cantidad_actual': 18112,
    'peso_inicial_g': 42.0,
    'estado': 'ACTIVO',
    'sincronizado': 1,
  },
  {
    'id': 2,
    'uuid': 'uuid-lote-engorde-02',
    'codigo': 'PE-2026-092',
    'galpon_id': 3,
    'tipo_ave': 'ENGORDE',
    'linea_genetica': 'Cobb 500',
    'fecha_ingreso': '2026-09-08',
    'edad_dias_inicial': 1,
    'cantidad_inicial': 24000,
    'cantidad_actual': 23688,
    'peso_inicial_g': 41.5,
    'estado': 'ACTIVO',
    'sincronizado': 1,
  },
  {
    'id': 3,
    'uuid': 'uuid-lote-ponedora-01',
    'codigo': 'GP-2026-014',
    'galpon_id': 4,
    'tipo_ave': 'PONEDORA',
    'linea_genetica': 'Lohmann Brown-Classic',
    'fecha_ingreso': '2025-10-10',
    'edad_dias_inicial': 1,
    'cantidad_inicial': 13500,
    'cantidad_actual': 13120,
    'peso_inicial_g': 38.0,
    'estado': 'ACTIVO',
    'sincronizado': 1,
  },
];
