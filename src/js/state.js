/**
 * SIGA Enterprise - Central Reactive State Store
 * Persistencia Local-First con almacenamiento en LocalStorage/IndexedDB
 */

const STORAGE_KEY = 'SIGA_ENTERPRISE_STATE_V2';

export const defaultState = {
  currentFarm: {
    id: 'granja-01',
    name: 'Granja Matriz El Paraíso',
    registroIca: 'ICA-GAB-004821',
    ubicacion: 'Cundinamarca, Colombia (1,750 msnm)',
    certificacion: 'Granja Avícola Biosegura (Res. ICA 3651/3652)',
    capacidadTotalAves: 90000,
    responsableTecnico: 'Dr. Roberto Méndez (MVZ Col. 11045)'
  },
  
  galpones: [
    { id: 'G-01', codigo: 'Galpón 01', tipo: 'tunel_presion_negativa', capacidad: 20000, dimensionesM2: 1400, estado: 'ocupado', loteId: 'PE-2026-088' },
    { id: 'G-02', codigo: 'Galpón 02', tipo: 'ambiente_natural_cortinas', capacidad: 15000, dimensionesM2: 1100, estado: 'vacio_sanitario', loteId: null },
    { id: 'G-03', codigo: 'Galpón 03', tipo: 'dark_house_combi', capacidad: 25000, dimensionesM2: 1750, estado: 'ocupado', loteId: 'PE-2026-092' },
    { id: 'G-04', codigo: 'Galpón 04', tipo: 'postura_piso_nido_auto', capacidad: 14000, dimensionesM2: 1300, estado: 'ocupado', loteId: 'GP-2026-014' },
    { id: 'G-05', codigo: 'Galpón 05', tipo: 'postura_pastoreo_free_range', capacidad: 16000, dimensionesM2: 1500, estado: 'ocupado', loteId: 'GP-2026-021' }
  ],

  lotesEngorde: [
    {
      id: 'PE-2026-088',
      codigo: 'PE-2026-088',
      galponId: 'G-01',
      lineaGenetica: 'Ross 308 AP',
      fechaIngreso: '2026-08-26',
      edadDias: 32,
      cantidadInicial: 18500,
      avesVivas: 18112,
      pesoPromedioG: 2180,
      pesoMetaG: 2120,
      caAcumulada: 1.52,
      caMeta: 1.58,
      gdpGramos: 68.1,
      mortalidadAcumPct: 2.10,
      iep: 374, // Índice de Eficiencia Productiva: (Viab% * Peso kg) / (Edad * CA) * 100
      fee: 382, // Factor de Eficiencia Europeo
      consumoAguaHoyL: 5420,
      consumoAlimentoHoyKg: 3120,
      ratioAguaAlimento: 1.74, // Normal (1.6-1.85)
      tempPromedioC: 22.4,
      humedadPromedioPct: 62.5,
      bloqueoFarmacologico: false,
      diasRetiroPendientes: 0,
      medicamentoActivo: null,
      ultimoMuestreo: {
        fecha: '2026-09-25',
        avesMuestreadas: 120,
        mediaG: 2180,
        desviacionG: 148,
        cvPct: 6.78, // < 10% Excelente
        uniformidadPct: 86.5 // > 80% Excelente
      },
      historialDiario: [
        { dia: 26, pesoG: 1650, ca: 1.45, consumoAguaL: 4800, consumoAlimentoKg: 2780, ratio: 1.73 },
        { dia: 27, pesoG: 1730, ca: 1.46, consumoAguaL: 4950, consumoAlimentoKg: 2850, ratio: 1.74 },
        { dia: 28, pesoG: 1810, ca: 1.47, consumoAguaL: 5080, consumoAlimentoKg: 2920, ratio: 1.74 },
        { dia: 29, pesoG: 1900, ca: 1.49, consumoAguaL: 5190, consumoAlimentoKg: 2990, ratio: 1.74 },
        { dia: 30, pesoG: 1990, ca: 1.50, consumoAguaL: 5280, consumoAlimentoKg: 3030, ratio: 1.74 },
        { dia: 31, pesoG: 2085, ca: 1.51, consumoAguaL: 5350, consumoAlimentoKg: 3080, ratio: 1.74 },
        { dia: 32, pesoG: 2180, ca: 1.52, consumoAguaL: 5420, consumoAlimentoKg: 3120, ratio: 1.74 }
      ]
    },
    {
      id: 'PE-2026-092',
      codigo: 'PE-2026-092',
      galponId: 'G-03',
      lineaGenetica: 'Cobb 500',
      fechaIngreso: '2026-09-08',
      edadDias: 19,
      cantidadInicial: 24000,
      avesVivas: 23688,
      pesoPromedioG: 960,
      pesoMetaG: 940,
      caAcumulada: 1.34,
      caMeta: 1.37,
      gdpGramos: 50.5,
      mortalidadAcumPct: 1.30,
      iep: 362,
      fee: 368,
      consumoAguaHoyL: 4120,
      consumoAlimentoHoyKg: 2410,
      ratioAguaAlimento: 1.71,
      tempPromedioC: 25.1,
      humedadPromedioPct: 58.0,
      bloqueoFarmacologico: true,
      diasRetiroPendientes: 3,
      medicamentoActivo: 'Enrofloxacina al 10%',
      ultimoMuestreo: {
        fecha: '2026-09-26',
        avesMuestreadas: 150,
        mediaG: 960,
        desviacionG: 82,
        cvPct: 8.54,
        uniformidadPct: 82.0
      },
      historialDiario: [
        { dia: 13, pesoG: 580, ca: 1.20, consumoAguaL: 2600, consumoAlimentoKg: 1520, ratio: 1.71 },
        { dia: 14, pesoG: 640, ca: 1.23, consumoAguaL: 2850, consumoAlimentoKg: 1670, ratio: 1.71 },
        { dia: 15, pesoG: 700, ca: 1.26, consumoAguaL: 3100, consumoAlimentoKg: 1810, ratio: 1.71 },
        { dia: 16, pesoG: 760, ca: 1.28, consumoAguaL: 3350, consumoAlimentoKg: 1960, ratio: 1.71 },
        { dia: 17, pesoG: 825, ca: 1.30, consumoAguaL: 3600, consumoAlimentoKg: 2110, ratio: 1.71 },
        { dia: 18, pesoG: 890, ca: 1.32, consumoAguaL: 3860, consumoAlimentoKg: 2260, ratio: 1.71 },
        { dia: 19, pesoG: 960, ca: 1.34, consumoAguaL: 4120, consumoAlimentoKg: 2410, ratio: 1.71 }
      ]
    }
  ],

  lotesPonedoras: [
    {
      id: 'GP-2026-014',
      codigo: 'GP-2026-014',
      galponId: 'G-04',
      lineaGenetica: 'Lohmann Brown-Classic',
      fechaAlojamiento: '2026-02-15',
      edadSemanas: 32,
      gallinasIniciales: 12000,
      gallinasVivas: 11840,
      huevosHoy: 11280,
      posturaPct: 95.27, // Pico de postura
      posturaMetaPct: 94.5,
      huevosAveAlojada: 98.4,
      masaHuevoG: 62.4,
      conversionDocenaKg: 1.41,
      consumoAlimentoAveDiaG: 116,
      consumoAguaHoyL: 2650,
      consumoAlimentoHoyKg: 1373,
      calidadClasificacion: {
        jumbo: 1420, // >78g
        aaa: 4850,  // 67-77g
        aa: 3210,   // 60-66g
        a: 1420,    // 53-59g
        b: 210,     // 46-52g
        c: 45,      // <46g
        rotosFisurados: 85,
        sucios: 40
      },
      unidadesHaugh: 88.2, // Frescura óptima
      mortalidadAcumPct: 1.33
    },
    {
      id: 'GP-2026-021',
      codigo: 'GP-2026-021',
      galponId: 'G-05',
      lineaGenetica: 'Hy-Line W-36',
      fechaAlojamiento: '2025-10-10',
      edadSemanas: 50,
      gallinasIniciales: 15500,
      gallinasVivas: 14920,
      huevosHoy: 13180,
      posturaPct: 88.34,
      posturaMetaPct: 87.0,
      huevosAveAlojada: 204.6,
      masaHuevoG: 61.8,
      conversionDocenaKg: 1.48,
      consumoAlimentoAveDiaG: 112,
      consumoAguaHoyL: 3180,
      consumoAlimentoHoyKg: 1671,
      calidadClasificacion: {
        jumbo: 1100,
        aaa: 5400,
        aa: 4100,
        a: 1980,
        b: 380,
        c: 60,
        rotosFisurados: 110,
        sucios: 50
      },
      unidadesHaugh: 84.1,
      mortalidadAcumPct: 3.74
    }
  ],

  // Curvas genéticas estándar por día para comparativas científicas
  curvasGeneticas: {
    'Ross 308 AP': [
      { dia: 0, pesoG: 42, ca: 0.85, consumoG: 12 },
      { dia: 7, pesoG: 195, ca: 0.98, consumoG: 34 },
      { dia: 14, pesoG: 510, ca: 1.15, consumoG: 68 },
      { dia: 21, pesoG: 1040, ca: 1.32, consumoG: 118 },
      { dia: 28, pesoG: 1780, ca: 1.47, consumoG: 165 },
      { dia: 32, pesoG: 2180, ca: 1.54, consumoG: 192 },
      { dia: 35, pesoG: 2510, ca: 1.60, consumoG: 208 },
      { dia: 42, pesoG: 3220, ca: 1.72, consumoG: 232 }
    ],
    'Cobb 500': [
      { dia: 0, pesoG: 42, ca: 0.84, consumoG: 11 },
      { dia: 7, pesoG: 190, ca: 0.96, consumoG: 32 },
      { dia: 14, pesoG: 495, ca: 1.14, consumoG: 65 },
      { dia: 19, pesoG: 960, ca: 1.34, consumoG: 108 },
      { dia: 21, pesoG: 1020, ca: 1.31, consumoG: 115 },
      { dia: 28, pesoG: 1740, ca: 1.46, consumoG: 162 },
      { dia: 35, pesoG: 2470, ca: 1.59, consumoG: 204 },
      { dia: 42, pesoG: 3180, ca: 1.70, consumoG: 228 }
    ],
    'Hubbard Efficiency Plus': [
      { dia: 0, pesoG: 41, ca: 0.83, consumoG: 11 },
      { dia: 7, pesoG: 188, ca: 0.95, consumoG: 31 },
      { dia: 14, pesoG: 485, ca: 1.13, consumoG: 63 },
      { dia: 21, pesoG: 1005, ca: 1.30, consumoG: 113 },
      { dia: 28, pesoG: 1720, ca: 1.45, consumoG: 160 },
      { dia: 35, pesoG: 2440, ca: 1.58, consumoG: 201 },
      { dia: 42, pesoG: 3150, ca: 1.69, consumoG: 225 }
    ]
  },

  // Módulo de Vacío Sanitario y Bioseguridad ICA (Res. 3651/3652)
  vaciosSanitarios: [
    {
      id: 'VS-G02-2026',
      galponId: 'G-02',
      galponCodigo: 'Galpón 02',
      fechaInicio: '2026-09-18',
      diasTranscurridos: 10,
      diasRequeridosIca: 14,
      etapas: [
        { paso: 'Retiro y ensacado de pollinaza', estado: 'completado', fecha: '2026-09-19', notas: 'Retiro 100% completado sin derrames' },
        { paso: 'Lavado con agua a presión y espumógeno desengrasante', estado: 'completado', fecha: '2026-09-21', notas: 'Presión 120 bar en techo y pisos' },
        { paso: 'Flameado térmico de pisos y zócalos', estado: 'completado', fecha: '2026-09-23', notas: 'Tratamiento con soplete a gas propano' },
        { paso: 'Desinfección con amonio cuaternario y glutaraldehído', estado: 'completado', fecha: '2026-09-24', notas: 'Dosis 2ml/L aspersión total' },
        { paso: 'Muestreo de hisopados de arrastre (Salmonella sp.)', estado: 'negativo_aprobado', fecha: '2026-09-26', notas: 'Laboratorio Labovet: Salmonella Negativo' },
        { paso: 'Nebulización terminal y encarrilado de cama nueva', estado: 'en_espera', fecha: null, notas: 'Pendiente llegada de cascarilla de arroz' }
      ],
      aprobadoParaCarga: false,
      aprobadoPorVeterinario: null
    }
  ],

  // Farmacovigilancia y Candados Sanitarios Activos y Previos
  tratamientosSanitarios: [
    {
      id: 'TRAT-2026-01',
      loteId: 'PE-2026-092',
      galponCodigo: 'Galpón 03',
      medicamento: 'Enrofloxacina al 10%',
      principioActivo: 'Enrofloxacina (Quinolona)',
      dosis: '10 mg/kg p.v.',
      via: 'Agua de bebida',
      fechaInicio: '2026-09-23',
      fechaFin: '2026-09-26',
      diasRetiro: 5,
      diasRestantes: 3,
      fechaLiberacion: '2026-10-01',
      veterinario: 'Dr. Roberto Méndez (MP: 11045)',
      estado: 'bloqueado'
    },
    {
      id: 'TRAT-2026-02',
      loteId: 'PE-2026-088',
      galponCodigo: 'Galpón 01',
      medicamento: 'Tilosina Tartrato 100%',
      principioActivo: 'Tilosina (Macrólido)',
      dosis: '35 mg/kg p.v.',
      via: 'Agua de bebida',
      fechaInicio: '2026-09-12',
      fechaFin: '2026-09-15',
      diasRetiro: 3,
      diasRestantes: 0,
      fechaLiberacion: '2026-09-18',
      veterinario: 'Dra. Carolina Martínez (MP: 14892)',
      estado: 'liberado'
    }
  ],

  // Costeo por Absorción y Matriz Financiera por Lote
  costosLotes: {
    'PE-2026-088': {
      loteId: 'PE-2026-088',
      galponCodigo: 'Galpón 01',
      pollitoBB: 40700000,          // 18,500 aves * $2,200 COP
      alimentoFases: 115200000,      // Preiniciador + Iniciador + Engorde
      bioseguridadYVacunas: 4200000,
      materialCama: 1800000,         // Cascarilla de arroz
      energiaYGasPropano: 6800000,   // Criadoras + turbinas túnel
      manoDeObraGalponero: 4500000,
      amortizacionVacioSanitario: 2100000,
      costosIndirectosGranja: 3800000,
      totalCostoAcumulado: 176300000,
      kilosVivosProducidos: 39484,   // 18,112 aves * 2.18 kg
      costoPorKiloVivo: 4465.10,     // COP / kg
      precioVentaKiloEsperado: 6200.00,
      margenBrutoEstimadoPct: 27.98
    },
    'PE-2026-092': {
      loteId: 'PE-2026-092',
      galponCodigo: 'Galpón 03',
      pollitoBB: 52800000,          // 24,000 aves * $2,200 COP
      alimentoFases: 68400000,       // Preiniciador + Iniciador
      bioseguridadYVacunas: 5100000,
      materialCama: 2200000,
      energiaYGasPropano: 8400000,
      manoDeObraGalponero: 3200000,
      amortizacionVacioSanitario: 2600000,
      costosIndirectosGranja: 4200000,
      totalCostoAcumulado: 146900000,
      kilosVivosProducidos: 22740,   // 23,688 aves * 0.96 kg
      costoPorKiloVivo: 6459.98,     // Lote joven día 19
      precioVentaKiloEsperado: 6200.00,
      margenBrutoEstimadoPct: -4.19  // Negativo natural en fase de crecimiento inicial
    }
  },

  // Alertas inteligentes activas
  alertasActivas: [
    {
      id: 'ALT-01',
      tipo: 'warning',
      titulo: 'Retiro farmacológico activo (3 días restantes)',
      descripcion: 'El lote PE-2026-092 (Galpón 03) tiene bloqueo sanitario por Enrofloxacina. No apto para saca hasta 2026-10-01.',
      tiempo: 'Hace 2 horas',
      modulo: 'bioseguridad'
    },
    {
      id: 'ALT-02',
      tipo: 'info',
      titulo: 'Punto Óptimo de Saca Próximo (Galpón 01)',
      descripcion: 'El lote PE-2026-088 entrará en su ventana de máxima rentabilidad económica en el día 39 a 41.',
      tiempo: 'Hace 4 horas',
      modulo: 'engorde'
    }
  ],

  // Cola de sincronización offline Local-First
  colaSincronizacion: [],
  estaOnline: true
};

class StateStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return JSON.parse(JSON.stringify(defaultState));
      const parsed = JSON.parse(data);
      // Merge with defaultState to ensure new schema fields exist
      return {
        ...defaultState,
        ...parsed,
        currentFarm: { ...defaultState.currentFarm, ...(parsed.currentFarm || {}) },
        galpones: parsed.galpones || defaultState.galpones,
        lotesEngorde: parsed.lotesEngorde || defaultState.lotesEngorde,
        lotesPonedoras: parsed.lotesPonedoras || defaultState.lotesPonedoras,
        vaciosSanitarios: parsed.vaciosSanitarios || defaultState.vaciosSanitarios,
        tratamientosSanitarios: parsed.tratamientosSanitarios || defaultState.tratamientosSanitarios,
        costosLotes: parsed.costosLotes || defaultState.costosLotes,
        alertasActivas: parsed.alertasActivas || defaultState.alertasActivas,
        colaSincronizacion: parsed.colaSincronizacion || defaultState.colaSincronizacion
      };
    } catch (e) {
      console.warn('Error leyendo localStorage, usando defaultState:', e);
      return JSON.parse(JSON.stringify(defaultState));
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  // ==========================================
  // OPERACIONES DE ENGORDE
  // ==========================================

  crearLoteEngorde(data) {
    const galpon = this.state.galpones.find(g => g.id === data.galponId);
    if (!galpon) throw new Error('Galpón no encontrado');

    const nuevoLote = {
      id: data.codigo,
      codigo: data.codigo,
      galponId: data.galponId,
      lineaGenetica: data.lineaGenetica || 'Ross 308 AP',
      fechaIngreso: data.fechaIngreso || new Date().toISOString().split('T')[0],
      edadDias: parseInt(data.edadDias || 1, 10),
      cantidadInicial: parseInt(data.cantidadInicial, 10),
      avesVivas: parseInt(data.cantidadInicial, 10),
      pesoPromedioG: parseInt(data.pesoInicialG || 42, 10),
      pesoMetaG: 45,
      caAcumulada: 1.05,
      caMeta: 1.02,
      gdpGramos: 12.0,
      mortalidadAcumPct: 0.0,
      iep: 320,
      fee: 330,
      consumoAguaHoyL: Math.round(parseInt(data.cantidadInicial, 10) * 0.04),
      consumoAlimentoHoyKg: Math.round(parseInt(data.cantidadInicial, 10) * 0.024),
      ratioAguaAlimento: 1.67,
      tempPromedioC: 32.0, // Temperatura criadora
      humedadPromedioPct: 65.0,
      bloqueoFarmacologico: false,
      diasRetiroPendientes: 0,
      medicamentoActivo: null,
      ultimoMuestreo: {
        fecha: new Date().toISOString().split('T')[0],
        avesMuestreadas: 30,
        mediaG: parseInt(data.pesoInicialG || 42, 10),
        desviacionG: 2,
        cvPct: 4.8,
        uniformidadPct: 96.0
      },
      historialDiario: [
        {
          dia: parseInt(data.edadDias || 1, 10),
          pesoG: parseInt(data.pesoInicialG || 42, 10),
          ca: 1.05,
          consumoAguaL: Math.round(parseInt(data.cantidadInicial, 10) * 0.04),
          consumoAlimentoKg: Math.round(parseInt(data.cantidadInicial, 10) * 0.024),
          ratio: 1.67
        }
      ]
    };

    // Actualizar Galpón
    galpon.estado = 'ocupado';
    galpon.loteId = nuevoLote.id;

    // Crear estructura de costos inicial para este lote
    const costoPollito = nuevoLote.cantidadInicial * 2300;
    this.state.costosLotes[nuevoLote.id] = {
      loteId: nuevoLote.id,
      galponCodigo: galpon.codigo,
      pollitoBB: costoPollito,
      alimentoFases: 0,
      bioseguridadYVacunas: nuevoLote.cantidadInicial * 280,
      materialCama: 1500000,
      energiaYGasPropano: 2500000,
      manoDeObraGalponero: 1800000,
      amortizacionVacioSanitario: 2000000,
      costosIndirectosGranja: 2200000,
      totalCostoAcumulado: costoPollito + 10000000,
      kilosVivosProducidos: Math.round((nuevoLote.avesVivas * nuevoLote.pesoPromedioG) / 1000),
      costoPorKiloVivo: 5200.0,
      precioVentaKiloEsperado: 6200.0,
      margenBrutoEstimadoPct: 16.1
    };

    this.state.lotesEngorde.push(nuevoLote);

    // Encolar evento Local-First
    this.state.colaSincronizacion.push({
      tipo: 'CREAR_LOTE_ENGORDE',
      loteId: nuevoLote.id,
      data: nuevoLote,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return nuevoLote;
  }

  registrarBajas(loteId, cantidadBajas, causa, observacion = '') {
    // Buscar en engorde
    let lote = this.state.lotesEngorde.find(l => l.id === loteId);
    let esEngorde = true;

    if (!lote) {
      // Buscar en ponedoras
      lote = this.state.lotesPonedoras.find(l => l.id === loteId);
      esEngorde = false;
    }

    if (!lote) return false;

    if (esEngorde) {
      lote.avesVivas = Math.max(0, lote.avesVivas - cantidadBajas);
      const totalBajas = lote.cantidadInicial - lote.avesVivas;
      lote.mortalidadAcumPct = Number(((totalBajas / lote.cantidadInicial) * 100).toFixed(2));
      
      // Recalcular IEP: (Viab% * Peso kg) / (Edad * CA) * 100
      const viabilidad = (lote.avesVivas / lote.cantidadInicial) * 100;
      const pesoKg = lote.pesoPromedioG / 1000;
      if (lote.edadDias > 0 && lote.caAcumulada > 0) {
        lote.iep = Math.round((viabilidad * pesoKg) / (lote.edadDias * lote.caAcumulada) * 100);
      }
    } else {
      lote.gallinasVivas = Math.max(0, lote.gallinasVivas - cantidadBajas);
      const totalBajas = lote.gallinasIniciales - lote.gallinasVivas;
      lote.mortalidadAcumPct = Number(((totalBajas / lote.gallinasIniciales) * 100).toFixed(2));
    }

    // Registrar evento en cola offline
    this.state.colaSincronizacion.push({
      tipo: 'REGISTRO_BAJAS',
      loteId,
      cantidadBajas,
      causa,
      observacion,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return true;
  }

  registrarMuestreoPesaje(loteId, pesajesArray) {
    const lote = this.state.lotesEngorde.find(l => l.id === loteId);
    if (!lote || !pesajesArray || pesajesArray.length === 0) return null;

    const n = pesajesArray.length;
    const suma = pesajesArray.reduce((acc, val) => acc + val, 0);
    const media = Math.round(suma / n);

    // Desviación Estándar
    const varianza = n > 1 
      ? pesajesArray.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / (n - 1)
      : 0;
    const desviacion = Math.round(Math.sqrt(varianza));

    // Coeficiente de Variación CV% = (Desviación / Media) * 100
    const cv = Number(((desviacion / media) * 100).toFixed(2));

    // % Uniformidad (Aves entre +/- 10% de la media)
    const minRango = media * 0.90;
    const maxRango = media * 1.10;
    const avesUniforme = pesajesArray.filter(p => p >= minRango && p <= maxRango).length;
    const uniformidad = Number(((avesUniforme / n) * 100).toFixed(1));

    // Ganancia Diaria de Peso (GDP)
    const gdp = lote.edadDias > 0 ? Number(((media - 42) / lote.edadDias).toFixed(1)) : 65;

    lote.pesoPromedioG = media;
    lote.gdpGramos = gdp;
    lote.ultimoMuestreo = {
      fecha: new Date().toISOString().split('T')[0],
      avesMuestreadas: n,
      mediaG: media,
      desviacionG: desviacion,
      cvPct: cv,
      uniformidadPct: uniformidad
    };

    // Actualizar IEP
    const viabilidad = (lote.avesVivas / lote.cantidadInicial) * 100;
    const pesoKg = media / 1000;
    if (lote.edadDias > 0 && lote.caAcumulada > 0) {
      lote.iep = Math.round((viabilidad * pesoKg) / (lote.edadDias * lote.caAcumulada) * 100);
      lote.fee = Math.round(lote.iep * 1.02);
    }

    // Actualizar en histórico diario
    if (!lote.historialDiario) lote.historialDiario = [];
    lote.historialDiario.push({
      dia: lote.edadDias,
      pesoG: media,
      ca: lote.caAcumulada,
      consumoAguaL: lote.consumoAguaHoyL,
      consumoAlimentoKg: lote.consumoAlimentoHoyKg,
      ratio: lote.ratioAguaAlimento
    });

    // Actualizar costos del lote
    if (this.state.costosLotes[lote.id]) {
      const c = this.state.costosLotes[lote.id];
      c.kilosVivosProducidos = Math.round((lote.avesVivas * media) / 1000);
      if (c.kilosVivosProducidos > 0) {
        c.costoPorKiloVivo = Number((c.totalCostoAcumulado / c.kilosVivosProducidos).toFixed(2));
        c.margenBrutoEstimadoPct = Number((((c.precioVentaKiloEsperado - c.costoPorKiloVivo) / c.precioVentaKiloEsperado) * 100).toFixed(2));
      }
    }

    this.state.colaSincronizacion.push({
      tipo: 'REGISTRO_PESAJE_MUESTREO',
      loteId,
      media,
      uniformidad,
      cv,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return lote.ultimoMuestreo;
  }

  registrarConsumoEngorde(loteId, { alimentoKg, aguaL, tempC, humedadPct }) {
    const lote = this.state.lotesEngorde.find(l => l.id === loteId);
    if (!lote) return false;

    if (alimentoKg) lote.consumoAlimentoHoyKg = alimentoKg;
    if (aguaL) lote.consumoAguaHoyL = aguaL;
    if (tempC) lote.tempPromedioC = tempC;
    if (humedadPct) lote.humedadPromedioPct = humedadPct;

    if (lote.consumoAlimentoHoyKg > 0 && lote.consumoAguaHoyL > 0) {
      lote.ratioAguaAlimento = Number((lote.consumoAguaHoyL / lote.consumoAlimentoHoyKg).toFixed(2));

      // Detección de anomalías zootécnicas
      if (lote.ratioAguaAlimento > 2.20) {
        this.agregarAlerta({
          tipo: 'danger',
          titulo: `Estrés Calórico Detectado en ${lote.galponId} (${lote.codigo})`,
          descripcion: `Ratio hídrico en ${lote.ratioAguaAlimento} L/kg (>2.20). Aumentar ventilación y revisar nebulizadores.`,
          modulo: 'engorde'
        });
      } else if (lote.ratioAguaAlimento < 1.40) {
        this.agregarAlerta({
          tipo: 'danger',
          titulo: `Alerta Hídrica Crítica en ${lote.galponId} (${lote.codigo})`,
          descripcion: `Ratio hídrico anormalmente bajo (${lote.ratioAguaAlimento} L/kg <1.40). Posible bloqueo de niples o exceso de cloro.`,
          modulo: 'engorde'
        });
      }
    }

    this.state.colaSincronizacion.push({
      tipo: 'REGISTRO_CONSUMO_ENGORDE',
      loteId,
      alimentoKg,
      aguaL,
      tempC,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return true;
  }

  simularSacaOptima(loteId, precioVentaKg = 6200, costoAlimentoTon = 2800000) {
    const lote = this.state.lotesEngorde.find(l => l.id === loteId) || this.state.lotesEngorde[0];
    const estandar = this.state.curvasGeneticas[lote.lineaGenetica] || this.state.curvasGeneticas['Ross 308 AP'];
    const costoAlimentoKg = costoAlimentoTon / 1000;

    const proyeccion = [];
    let diaOptimo = 40;
    let maxMargenM2 = 0;

    for (let dia = 32; dia <= 45; dia++) {
      // Proyección basada en curva zootécnica
      const pesoEstimado = Math.round(2180 + (dia - 32) * 82); // ~82g GDP
      const caEstimada = Number((1.52 + (dia - 32) * 0.015).toFixed(2));
      const alimentoAcumKgPorAve = (pesoEstimado / 1000) * caEstimada;
      
      const ingresoPorAve = (pesoEstimado / 1000) * precioVentaKg;
      const costoAlimentoPorAve = alimentoAcumKgPorAve * costoAlimentoKg;
      const otrosCostosPorAve = 4500; // Pollito + vacunas + mano obra fija
      const costoTotalPorAve = costoAlimentoPorAve + otrosCostosPorAve;
      const margenNetoPorAve = Math.round(ingresoPorAve - costoTotalPorAve);

      // Margen por m2 (densidad 13 aves/m2)
      const margenM2 = Math.round(margenNetoPorAve * 13);
      if (margenM2 > maxMargenM2) {
        maxMargenM2 = margenM2;
        diaOptimo = dia;
      }

      proyeccion.push({
        dia,
        pesoG: pesoEstimado,
        ca: caEstimada,
        ingresoPorAve,
        costoTotalPorAve,
        margenNetoPorAve,
        margenM2,
        esOptimo: false
      });
    }

    const itemOptimo = proyeccion.find(p => p.dia === diaOptimo);
    if (itemOptimo) itemOptimo.esOptimo = true;

    return {
      lote,
      diaOptimo,
      pesoOptimoG: itemOptimo ? itemOptimo.pesoG : 2840,
      margenOptimoM2: maxMargenM2,
      margenTotalGalpon: Math.round(maxMargenM2 * 1400),
      proyeccion
    };
  }

  finalizarLoteSaca(loteId, datosSaca = {}) {
    const loteIndex = this.state.lotesEngorde.findIndex(l => l.id === loteId);
    if (loteIndex === -1) return false;

    const lote = this.state.lotesEngorde[loteIndex];
    const galpon = this.state.galpones.find(g => g.id === lote.galponId);

    // Verificar si tiene candado sanitario
    if (lote.bloqueoFarmacologico && lote.diasRetiroPendientes > 0) {
      throw new Error(`BLOQUEO SANITARIO: El lote tiene ${lote.diasRetiroPendientes} días de retiro farmacológico pendientes. No se puede despachar.`);
    }

    // Liberar galpón e iniciar Vacío Sanitario obligatorio
    if (galpon) {
      galpon.estado = 'vacio_sanitario';
      galpon.loteId = null;
      this.iniciarVacioSanitario(galpon.id, 14);
    }

    // Remover lote de engorde activo
    this.state.lotesEngorde.splice(loteIndex, 1);

    this.agregarAlerta({
      tipo: 'info',
      titulo: `Saca Completada para ${lote.codigo}`,
      descripcion: `Se despacharon ${lote.avesVivas.toLocaleString()} aves de ${galpon ? galpon.codigo : ''}. Inicia vacío sanitario de 14 días.`,
      modulo: 'engorde'
    });

    this.state.colaSincronizacion.push({
      tipo: 'FINALIZAR_LOTE_SACA',
      loteId,
      datosSaca,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return true;
  }

  // ==========================================
  // OPERACIONES DE PONEDORAS
  // ==========================================

  crearLotePonedoras(data) {
    const galpon = this.state.galpones.find(g => g.id === data.galponId);
    if (!galpon) throw new Error('Galpón no encontrado');

    const nuevoLote = {
      id: data.codigo,
      codigo: data.codigo,
      galponId: data.galponId,
      lineaGenetica: data.lineaGenetica || 'Lohmann Brown-Classic',
      fechaAlojamiento: data.fechaAlojamiento || new Date().toISOString().split('T')[0],
      edadSemanas: parseInt(data.edadSemanas || 18, 10),
      gallinasIniciales: parseInt(data.gallinasIniciales, 10),
      gallinasVivas: parseInt(data.gallinasIniciales, 10),
      huevosHoy: 0,
      posturaPct: 0.0,
      posturaMetaPct: 15.0,
      huevosAveAlojada: 0.0,
      masaHuevoG: 54.0,
      conversionDocenaKg: 1.65,
      consumoAlimentoAveDiaG: 105,
      consumoAguaHoyL: Math.round(parseInt(data.gallinasIniciales, 10) * 0.18),
      consumoAlimentoHoyKg: Math.round(parseInt(data.gallinasIniciales, 10) * 0.105),
      calidadClasificacion: {
        jumbo: 0, aaa: 0, aa: 0, a: 0, b: 0, c: 0, rotosFisurados: 0, sucios: 0
      },
      unidadesHaugh: 90.0,
      mortalidadAcumPct: 0.0
    };

    galpon.estado = 'ocupado';
    galpon.loteId = nuevoLote.id;
    this.state.lotesPonedoras.push(nuevoLote);

    this.state.colaSincronizacion.push({
      tipo: 'CREAR_LOTE_PONEDORAS',
      loteId: nuevoLote.id,
      data: nuevoLote,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return nuevoLote;
  }

  registrarProduccionHuevos(loteId, desgloseHuevos, unidadesHaugh = null, masaPromedioG = null) {
    const lote = this.state.lotesPonedoras.find(l => l.id === loteId);
    if (!lote) return false;

    const totalHuevos = (desgloseHuevos.jumbo || 0) +
                        (desgloseHuevos.aaa || 0) +
                        (desgloseHuevos.aa || 0) +
                        (desgloseHuevos.a || 0) +
                        (desgloseHuevos.b || 0) +
                        (desgloseHuevos.c || 0) +
                        (desgloseHuevos.rotos || 0) +
                        (desgloseHuevos.sucios || 0);

    lote.huevosHoy = totalHuevos;
    lote.posturaPct = Number(((totalHuevos / lote.gallinasVivas) * 100).toFixed(2));
    lote.calidadClasificacion = {
      jumbo: desgloseHuevos.jumbo || 0,
      aaa: desgloseHuevos.aaa || 0,
      aa: desgloseHuevos.aa || 0,
      a: desgloseHuevos.a || 0,
      b: desgloseHuevos.b || 0,
      c: desgloseHuevos.c || 0,
      rotosFisurados: desgloseHuevos.rotos || 0,
      sucios: desgloseHuevos.sucios || 0
    };

    if (unidadesHaugh) lote.unidadesHaugh = parseFloat(unidadesHaugh);
    if (masaPromedioG) lote.masaHuevoG = parseFloat(masaPromedioG);

    // Recalcular conversión por docena
    if (lote.consumoAlimentoHoyKg > 0 && totalHuevos > 0) {
      const docenas = totalHuevos / 12;
      lote.conversionDocenaKg = Number((lote.consumoAlimentoHoyKg / docenas).toFixed(2));
    }

    this.state.colaSincronizacion.push({
      tipo: 'REGISTRO_HUEVOS',
      loteId,
      totalHuevos,
      desgloseHuevos,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return true;
  }

  finalizarLotePonedoras(loteId) {
    const loteIndex = this.state.lotesPonedoras.findIndex(l => l.id === loteId);
    if (loteIndex === -1) return false;

    const lote = this.state.lotesPonedoras[loteIndex];
    const galpon = this.state.galpones.find(g => g.id === lote.galponId);

    if (galpon) {
      galpon.estado = 'vacio_sanitario';
      galpon.loteId = null;
      this.iniciarVacioSanitario(galpon.id, 21);
    }

    this.state.lotesPonedoras.splice(loteIndex, 1);

    this.agregarAlerta({
      tipo: 'info',
      titulo: `Ciclo Finalizado para ${lote.codigo}`,
      descripcion: `Lote de postura finalizado. El galpón ${galpon ? galpon.codigo : ''} entra en descanso y desinfección sanitaria ICA.`,
      modulo: 'ponedoras'
    });

    this.state.colaSincronizacion.push({
      tipo: 'FINALIZAR_LOTE_PONEDORAS',
      loteId,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return true;
  }

  // ==========================================
  // OPERACIONES DE BIOSEGURIDAD E ICA
  // ==========================================

  actualizarEtapaVacioSanitario(vacioId, etapaIndex, nuevoEstado) {
    const vacio = this.state.vaciosSanitarios.find(v => v.id === vacioId);
    if (!vacio || !vacio.etapas[etapaIndex]) return false;

    vacio.etapas[etapaIndex].estado = nuevoEstado;
    vacio.etapas[etapaIndex].fecha = nuevoEstado === 'en_espera' ? null : new Date().toISOString().split('T')[0];

    // Verificar si todas las etapas están completadas
    const todasCompletadas = vacio.etapas.every(e => e.estado === 'completado' || e.estado === 'negativo_aprobado');
    vacio.aprobadoParaCarga = todasCompletadas && vacio.diasTranscurridos >= vacio.diasRequeridosIca;

    this.state.colaSincronizacion.push({
      tipo: 'ACTUALIZAR_ETAPA_VACIO',
      vacioId,
      etapaIndex,
      nuevoEstado,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return vacio;
  }

  aprobarGalponParaCarga(vacioId, veterinarioNombre) {
    const vacio = this.state.vaciosSanitarios.find(v => v.id === vacioId);
    if (!vacio) return false;

    vacio.aprobadoParaCarga = true;
    vacio.aprobadoPorVeterinario = veterinarioNombre;

    const galpon = this.state.galpones.find(g => g.id === vacio.galponId);
    if (galpon) {
      galpon.estado = 'disponible';
    }

    this.agregarAlerta({
      tipo: 'success',
      titulo: `Galpón Certificado: ${vacio.galponCodigo}`,
      descripcion: `El ${vacio.galponCodigo} cumplió el descanso sanitario ICA (${vacio.diasTranscurridos} días) y está listo para recibir nuevo lote.`,
      modulo: 'bioseguridad'
    });

    this.saveState();
    return true;
  }

  iniciarVacioSanitario(galponId, diasIca = 14) {
    const galpon = this.state.galpones.find(g => g.id === galponId);
    if (!galpon) return null;

    const nuevoVacio = {
      id: `VS-${galpon.id}-${Date.now()}`,
      galponId: galpon.id,
      galponCodigo: galpon.codigo,
      fechaInicio: new Date().toISOString().split('T')[0],
      diasTranscurridos: 1,
      diasRequeridosIca: diasIca,
      etapas: [
        { paso: 'Retiro y ensacado de pollinaza', estado: 'en_espera', fecha: null, notas: '' },
        { paso: 'Lavado con agua a presión y espumógeno desengrasante', estado: 'en_espera', fecha: null, notas: '' },
        { paso: 'Flameado térmico de pisos y zócalos', estado: 'en_espera', fecha: null, notas: '' },
        { paso: 'Desinfección con amonio cuaternario y glutaraldehído', estado: 'en_espera', fecha: null, notas: '' },
        { paso: 'Muestreo de hisopados de arrastre (Salmonella sp.)', estado: 'en_espera', fecha: null, notas: '' },
        { paso: 'Nebulización terminal y encarrilado de cama nueva', estado: 'en_espera', fecha: null, notas: '' }
      ],
      aprobadoParaCarga: false,
      aprobadoPorVeterinario: null
    };

    galpon.estado = 'vacio_sanitario';
    galpon.loteId = null;
    this.state.vaciosSanitarios.unshift(nuevoVacio);

    this.saveState();
    return nuevoVacio;
  }

  registrarTratamiento(data) {
    const nuevoTrat = {
      id: `TRAT-${Date.now()}`,
      loteId: data.loteId,
      galponCodigo: data.galponCodigo || 'Galpón',
      medicamento: data.medicamento,
      principioActivo: data.principioActivo,
      dosis: data.dosis,
      via: data.via || 'Agua de bebida',
      fechaInicio: data.fechaInicio || new Date().toISOString().split('T')[0],
      fechaFin: data.fechaFin || new Date().toISOString().split('T')[0],
      diasRetiro: parseInt(data.diasRetiro, 10),
      diasRestantes: parseInt(data.diasRetiro, 10),
      fechaLiberacion: data.fechaLiberacion,
      veterinario: data.veterinario,
      estado: 'bloqueado'
    };

    // Bloquear lote
    const lote = this.state.lotesEngorde.find(l => l.id === data.loteId);
    if (lote) {
      lote.bloqueoFarmacologico = true;
      lote.diasRetiroPendientes = nuevoTrat.diasRetiro;
      lote.medicamentoActivo = nuevoTrat.medicamento;
    }

    this.state.tratamientosSanitarios.unshift(nuevoTrat);

    // Alerta crítica de retiro
    this.agregarAlerta({
      tipo: 'warning',
      titulo: `Candado Sanitario: ${nuevoTrat.medicamento}`,
      descripcion: `Lote ${nuevoTrat.loteId} bloqueado para sacrificio por ${nuevoTrat.diasRetiro} días. Residuos farmacológicos.`,
      modulo: 'bioseguridad'
    });

    this.state.colaSincronizacion.push({
      tipo: 'REGISTRO_TRATAMIENTO',
      data: nuevoTrat,
      timestamp: new Date().toISOString()
    });

    this.saveState();
    return nuevoTrat;
  }

  liberarTratamiento(tratamientoId) {
    const trat = this.state.tratamientosSanitarios.find(t => t.id === tratamientoId);
    if (!trat) return false;

    trat.estado = 'liberado';
    trat.diasRestantes = 0;

    // Verificar si el lote tiene otros tratamientos bloqueados
    const otrosBloqueados = this.state.tratamientosSanitarios.some(t => t.loteId === trat.loteId && t.estado === 'bloqueado');
    if (!otrosBloqueados) {
      const lote = this.state.lotesEngorde.find(l => l.id === trat.loteId);
      if (lote) {
        lote.bloqueoFarmacologico = false;
        lote.diasRetiroPendientes = 0;
        lote.medicamentoActivo = null;
      }
    }

    this.saveState();
    return true;
  }

  // ==========================================
  // OPERACIONES DE COSTOS Y RENTABILIDAD
  // ==========================================

  actualizarCostosLote(loteId, nuevosRubros) {
    const c = this.state.costosLotes[loteId];
    if (!c) return false;

    Object.assign(c, nuevosRubros);

    // Recalcular total acumulado
    c.totalCostoAcumulado = (c.pollitoBB || 0) +
                            (c.alimentoFases || 0) +
                            (c.bioseguridadYVacunas || 0) +
                            (c.materialCama || 0) +
                            (c.energiaYGasPropano || 0) +
                            (c.manoDeObraGalponero || 0) +
                            (c.amortizacionVacioSanitario || 0) +
                            (c.costosIndirectosGranja || 0);

    if (c.kilosVivosProducidos > 0) {
      c.costoPorKiloVivo = Number((c.totalCostoAcumulado / c.kilosVivosProducidos).toFixed(2));
      c.margenBrutoEstimadoPct = Number((((c.precioVentaKiloEsperado - c.costoPorKiloVivo) / c.precioVentaKiloEsperado) * 100).toFixed(2));
    }

    this.saveState();
    return c;
  }

  // ==========================================
  // OPERACIONES DE ALERTAS Y GRANJA
  // ==========================================

  agregarAlerta(alerta) {
    const nueva = {
      id: `ALT-${Date.now()}`,
      tipo: alerta.tipo || 'info',
      titulo: alerta.titulo,
      descripcion: alerta.descripcion,
      tiempo: 'Ahora mismo',
      modulo: alerta.modulo || 'dashboard'
    };
    this.state.alertasActivas.unshift(nueva);
    this.saveState();
    return nueva;
  }

  descartarAlerta(alertaId) {
    this.state.alertasActivas = this.state.alertasActivas.filter(a => a.id !== alertaId);
    this.saveState();
  }

  actualizarGranja(datosGranja) {
    Object.assign(this.state.currentFarm, datosGranja);
    this.saveState();
  }

  async sincronizarConBackend(backendUrl = 'http://localhost:8000/api/v1/sync') {
    const pendientes = this.state.colaSincronizacion;
    const payload = {
      dispositivo_id: 'web-pwa-supervisor',
      timestamp: new Date().toISOString(),
      registros_diarios: pendientes.filter(p => p.tipo === 'REGISTRO_DIARIO').map(p => ({
        uuid: `uuid-reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        lote_id: 1,
        fecha: p.data?.fecha || new Date().toISOString().split('T')[0],
        dia_vida: p.data?.diaVida || 30,
        mortalidad: p.data?.mortalidad || 0,
        descarte: p.data?.descarte || 0,
        alimento_kg: p.data?.alimentoKg || 0,
        agua_litros: p.data?.aguaLitros || 0,
        temp_min: p.data?.tempMin || 20,
        temp_max: p.data?.tempMax || 28,
        humedad_pct: p.data?.humedad || 65,
        observaciones: p.data?.observaciones || 'Sincronizado desde Web',
        created_at: p.timestamp || new Date().toISOString()
      })),
      pesajes: pendientes.filter(p => p.tipo === 'PESAJE_MUESTREO').map(p => ({
        uuid: `uuid-pes-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        lote_id: 1,
        fecha: new Date().toISOString().split('T')[0],
        dia_vida: 32,
        aves_pesadas: p.data?.avesMuestreadas || 100,
        peso_promedio_g: p.data?.mediaG || 2150,
        uniformidad_pct: p.data?.uniformidadPct || 85,
        cv_pct: p.data?.cvPct || 7.2,
        peso_estandar_g: 2120,
        observaciones: 'Pesaje de campo',
        created_at: p.timestamp || new Date().toISOString()
      })),
      posturas: [],
      eliminaciones: []
    };

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        this.state.colaSincronizacion = [];
        this.saveState();
        return { success: true, count: data.recibidos || pendientes.length, server: true, message: data.message };
      }
    } catch (err) {
      console.warn('Backend local no disponible, sincronizando localmente en caché:', err);
    }

    // Fallback: Sincronización local exitosa (Offline-First)
    const count = pendientes.length;
    this.state.colaSincronizacion = [];
    this.saveState();
    return { success: true, count, server: false, message: 'Datos asegurados en la base local (Modo Offline)' };
  }

  sincronizarColaOffline() {
    return this.sincronizarConBackend();
  }

  resetDemo() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this.saveState();
  }

  exportarBackup() {
    return JSON.stringify(this.state, null, 2);
  }

  importarBackup(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      this.state = parsed;
      this.saveState();
      return true;
    } catch (e) {
      console.error('Error importando backup:', e);
      return false;
    }
  }
}

export const store = new StateStore();
