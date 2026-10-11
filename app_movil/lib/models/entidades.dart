// ============================================================================
// 🐔 ARCHIVO: entidades.dart (EL DICCIONARIO AVÍCOLA EN EL CELULAR)
// ============================================================================
// ¿QUÉ ES ESTE ARCHIVO Y PARA QUÉ SIRVE? (Explicado de forma sencilla)
//
// Imagínate que este archivo es como el DICCIONARIO y la LIBRETA DE MODELOS de la granja avícola.
// Aquí le enseñamos al celular qué significa cada elemento en el mundo real del galpón:
//
// 1. 🏡 ¿Qué es una Granja? -> El predio avícola oficial certificado por el ICA (ej: Granja El Paraíso).
// 2. 🏠 ¿Qué es un Galpón? -> La nave o estructura techada con ventilación túnel o jaula (ej: Galpón 01).
// 3. 🐥 ¿Qué es una Línea Genética? -> La estirpe zootécnica de las aves (Cobb 500, Ross 308, Lohmann Brown).
// 4. 📦 ¿Qué es un Lote? -> El grupo de aves que entraron el mismo día de edad 1 y crecen juntas.
// 5. 👨‍🌾 ¿Qué es un Operario? -> El galponero, veterinario o supervisor responsable.
// 6. 📋 ¿Qué es un Registro Diario? -> La planilla diaria donde se anota mortalidad, bultos de comida y litros de agua.
// 7. ⚖️ ¿Qué es un Pesaje Biométrico? -> Muestreo de 100 aves para calcular el peso medio, CV% y uniformidad.
// 8. 🥚 ¿Qué es la Producción de Huevos? -> Conteo y clasificación por calibre (Jumbo, AAA, AA, A, B) y calidad Haugh.
// 9. 🏆 ¿Qué es el Rendimiento Zootécnico? -> El cálculo del podio de medallas (Oro, Plata, Bronce) según IEP y CA.
// ============================================================================

import 'package:intl/intl.dart';

/// 🏡 CLASE GRANJA
class Granja {
  final int id;
  final String codigo;
  final String nombre;
  final String registroIca;
  final String municipio;
  final String departamento;
  final int capacidadTotal;

  Granja({
    required this.id,
    required this.codigo,
    required this.nombre,
    required this.registroIca,
    this.municipio = 'Fusagasugá',
    this.departamento = 'Cundinamarca',
    this.capacidadTotal = 85000,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'codigo': codigo,
      'nombre': nombre,
      'registro_ica': registroIca,
      'municipio': municipio,
      'departamento': departamento,
      'capacidad_total': capacidadTotal,
    };
  }

  factory Granja.fromMap(Map<String, dynamic> map) {
    return Granja(
      id: map['id'] is int ? map['id'] : int.tryParse(map['id']?.toString() ?? '1') ?? 1,
      codigo: map['codigo']?.toString() ?? '',
      nombre: map['nombre']?.toString() ?? '',
      registroIca: map['registro_ica']?.toString() ?? '',
      municipio: map['municipio']?.toString() ?? 'Fusagasugá',
      departamento: map['departamento']?.toString() ?? 'Cundinamarca',
      capacidadTotal: map['capacidad_total'] is int ? map['capacidad_total'] : int.tryParse(map['capacidad_total']?.toString() ?? '85000') ?? 85000,
    );
  }
}

/// 🏠 CLASE GALPON
class Galpon {
  final int id;
  final int granjaId;
  final String numero;
  final String tipoSistema; // 'Túnel Dinámico', 'Ambiente Natural', 'Aviario Jaula'
  final double areaM2;
  final int capacidadMaxima;
  final String estado; // 'OCUPADO', 'DISPONIBLE', 'VACIO_SANITARIO'
  final String? loteId;

  Galpon({
    required this.id,
    this.granjaId = 1,
    required this.numero,
    required this.tipoSistema,
    this.areaM2 = 1200.0,
    required this.capacidadMaxima,
    this.estado = 'OCUPADO',
    this.loteId,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'granja_id': granjaId,
      'numero': numero,
      'tipo_sistema': tipoSistema,
      'area_m2': areaM2,
      'capacidad_maxima': capacidadMaxima,
      'estado': estado,
      if (loteId != null) 'lote_id': loteId,
    };
  }

  factory Galpon.fromMap(Map<String, dynamic> map) {
    return Galpon(
      id: map['id'] is int ? map['id'] : int.tryParse(map['id']?.toString() ?? '1') ?? 1,
      granjaId: map['granja_id'] is int ? map['granja_id'] : int.tryParse(map['granja_id']?.toString() ?? '1') ?? 1,
      numero: map['numero']?.toString() ?? '',
      tipoSistema: map['tipo_sistema']?.toString() ?? 'Túnel Dinámico',
      areaM2: map['area_m2'] is num ? (map['area_m2'] as num).toDouble() : double.tryParse(map['area_m2']?.toString() ?? '1200') ?? 1200.0,
      capacidadMaxima: map['capacidad_maxima'] is int ? map['capacidad_maxima'] : int.tryParse(map['capacidad_maxima']?.toString() ?? '20000') ?? 20000,
      estado: map['estado']?.toString() ?? 'OCUPADO',
      loteId: map['lote_id']?.toString(),
    );
  }
}

/// 🐥 CLASE LÍNEA GENÉTICA
class LineaGenetica {
  final int id;
  final String codigo;
  final String nombre;
  final String tipoAve; // 'ENGORDE' o 'PONEDORA'
  final int diasCiclo;
  final double pesoMetaG;
  final double caMeta;
  final double posturaMetaPct;

  LineaGenetica({
    required this.id,
    required this.codigo,
    required this.nombre,
    required this.tipoAve,
    this.diasCiclo = 42,
    this.pesoMetaG = 2850.0,
    this.caMeta = 1.52,
    this.posturaMetaPct = 94.5,
  });
}

/// 📦 CLASE LOTE
class Lote {
  final int? id;
  final String uuid;
  final String codigo;
  final int galponId;
  final String tipoAve; // 'ENGORDE' o 'PONEDORA'
  final String lineaGenetica; // 'Cobb 500', 'Ross 308 AP', 'Lohmann Brown-Classic'
  final String fechaIngreso;
  final int edadDiasInicial;
  final int cantidadInicial;
  final int cantidadActual;
  final double pesoInicialG;
  final String estado; // 'ACTIVO' o 'FINALIZADO'
  final String? fechaCierre;
  final int sincronizado;

  Lote({
    this.id,
    required this.uuid,
    required this.codigo,
    required this.galponId,
    required this.tipoAve,
    required this.lineaGenetica,
    required this.fechaIngreso,
    this.edadDiasInicial = 1,
    required this.cantidadInicial,
    required this.cantidadActual,
    this.pesoInicialG = 42.0,
    this.estado = 'ACTIVO',
    this.fechaCierre,
    this.sincronizado = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'uuid': uuid,
      'codigo': codigo,
      'galpon_id': galponId,
      'tipo_ave': tipoAve,
      'linea_genetica': lineaGenetica,
      'fecha_ingreso': fechaIngreso,
      'edad_dias_inicial': edadDiasInicial,
      'cantidad_inicial': cantidadInicial,
      'cantidad_actual': cantidadActual,
      'peso_inicial_g': pesoInicialG,
      'estado': estado,
      if (fechaCierre != null) 'fecha_cierre': fechaCierre,
      'sincronizado': sincronizado,
    };
  }

  factory Lote.fromMap(Map<String, dynamic> map) {
    return Lote(
      id: map['id'],
      uuid: map['uuid']?.toString() ?? '',
      codigo: map['codigo']?.toString() ?? '',
      galponId: map['galpon_id'] is int ? map['galpon_id'] : int.tryParse(map['galpon_id']?.toString() ?? '1') ?? 1,
      tipoAve: map['tipo_ave']?.toString() ?? 'ENGORDE',
      lineaGenetica: map['linea_genetica']?.toString() ?? 'Cobb 500',
      fechaIngreso: map['fecha_ingreso']?.toString() ?? '',
      edadDiasInicial: map['edad_dias_inicial'] is int ? map['edad_dias_inicial'] : int.tryParse(map['edad_dias_inicial']?.toString() ?? '1') ?? 1,
      cantidadInicial: map['cantidad_inicial'] is int ? map['cantidad_inicial'] : int.tryParse(map['cantidad_inicial']?.toString() ?? '0') ?? 0,
      cantidadActual: map['cantidad_actual'] is int ? map['cantidad_actual'] : int.tryParse(map['cantidad_actual']?.toString() ?? '0') ?? 0,
      pesoInicialG: map['peso_inicial_g'] is num ? (map['peso_inicial_g'] as num).toDouble() : double.tryParse(map['peso_inicial_g']?.toString() ?? '42.0') ?? 42.0,
      estado: map['estado']?.toString() ?? 'ACTIVO',
      fechaCierre: map['fecha_cierre']?.toString(),
      sincronizado: map['sincronizado'] is int ? map['sincronizado'] : int.tryParse(map['sincronizado']?.toString() ?? '0') ?? 0,
    );
  }
}

/// 👨‍🌾 CLASE OPERARIO / GALPONERO
class Operario {
  final int id;
  final String cedula;
  final String nombreCompleto;
  final String cargo;
  final int activo;

  Operario({
    required this.id,
    required this.cedula,
    required this.nombreCompleto,
    this.cargo = 'Galponero',
    this.activo = 1,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'cedula': cedula,
      'nombre_completo': nombreCompleto,
      'cargo': cargo,
      'activo': activo,
    };
  }

  factory Operario.fromMap(Map<String, dynamic> map) {
    return Operario(
      id: map['id'] is int ? map['id'] : int.tryParse(map['id']?.toString() ?? '0') ?? 0,
      cedula: map['cedula']?.toString() ?? '',
      nombreCompleto: map['nombre_completo']?.toString() ?? '',
      cargo: map['cargo']?.toString() ?? 'Galponero',
      activo: map['activo'] is int ? map['activo'] : int.tryParse(map['activo']?.toString() ?? '1') ?? 1,
    );
  }
}

/// 📋 CLASE REGISTRO DIARIO
class RegistroDiario {
  final int? id;
  final String uuid;
  final int loteId;
  final String fecha;
  final int diaVida;
  final int mortalidad;
  final int descarte;
  final double alimentoKg;
  final double aguaLitros;
  final double? tempMin;
  final double? tempMax;
  final double? humedadPct;
  final String? observaciones;
  final int? operarioId;
  final int sincronizado;

  RegistroDiario({
    this.id,
    required this.uuid,
    required this.loteId,
    required this.fecha,
    required this.diaVida,
    this.mortalidad = 0,
    this.descarte = 0,
    this.alimentoKg = 0.0,
    this.aguaLitros = 0.0,
    this.tempMin,
    this.tempMax,
    this.humedadPct,
    this.observaciones,
    this.operarioId,
    this.sincronizado = 0,
  });

  double get ratioAguaAlimento => alimentoKg > 0 ? (aguaLitros / alimentoKg) : 0.0;

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id_local': id,
      'uuid': uuid,
      'lote_id': loteId,
      'fecha': fecha,
      'dia_vida': diaVida,
      'mortalidad': mortalidad,
      'descarte': descarte,
      'alimento_kg': alimentoKg,
      'agua_litros': aguaLitros,
      if (tempMin != null) 'temp_min': tempMin,
      if (tempMax != null) 'temp_max': tempMax,
      if (humedadPct != null) 'humedad_pct': humedadPct,
      if (observaciones != null) 'observaciones': observaciones,
      if (operarioId != null) 'operario_id': operarioId,
      'sincronizado': sincronizado,
    };
  }

  factory RegistroDiario.fromMap(Map<String, dynamic> map) {
    return RegistroDiario(
      id: map['id_local'] ?? map['id'],
      uuid: map['uuid']?.toString() ?? '',
      loteId: map['lote_id'] is int ? map['lote_id'] : int.tryParse(map['lote_id']?.toString() ?? '1') ?? 1,
      fecha: map['fecha']?.toString() ?? '',
      diaVida: map['dia_vida'] is int ? map['dia_vida'] : int.tryParse(map['dia_vida']?.toString() ?? '1') ?? 1,
      mortalidad: map['mortalidad'] is int ? map['mortalidad'] : int.tryParse(map['mortalidad']?.toString() ?? '0') ?? 0,
      descarte: map['descarte'] is int ? map['descarte'] : int.tryParse(map['descarte']?.toString() ?? '0') ?? 0,
      alimentoKg: map['alimento_kg'] is num ? (map['alimento_kg'] as num).toDouble() : double.tryParse(map['alimento_kg']?.toString() ?? '0') ?? 0.0,
      aguaLitros: map['agua_litros'] is num ? (map['agua_litros'] as num).toDouble() : double.tryParse(map['agua_litros']?.toString() ?? '0') ?? 0.0,
      tempMin: map['temp_min'] is num ? (map['temp_min'] as num).toDouble() : null,
      tempMax: map['temp_max'] is num ? (map['temp_max'] as num).toDouble() : null,
      humedadPct: map['humedad_pct'] is num ? (map['humedad_pct'] as num).toDouble() : null,
      observaciones: map['observaciones']?.toString(),
      operarioId: map['operario_id'] is int ? map['operario_id'] : null,
      sincronizado: map['sincronizado'] is int ? map['sincronizado'] : int.tryParse(map['sincronizado']?.toString() ?? '0') ?? 0,
    );
  }
}

/// ⚖️ CLASE PESAJE BIOMÉTRICO
class PesajeBiometrico {
  final int? id;
  final String uuid;
  final int loteId;
  final String fecha;
  final int diaVida;
  final int avesPesadas;
  final double pesoPromedioG;
  final double uniformidadPct;
  final double cvPct;
  final double pesoEstandarG;
  final String? observaciones;
  final int sincronizado;

  PesajeBiometrico({
    this.id,
    required this.uuid,
    required this.loteId,
    required this.fecha,
    required this.diaVida,
    required this.avesPesadas,
    required this.pesoPromedioG,
    required this.uniformidadPct,
    required this.cvPct,
    this.pesoEstandarG = 2120.0,
    this.observaciones,
    this.sincronizado = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id_local': id,
      'uuid': uuid,
      'lote_id': loteId,
      'fecha': fecha,
      'dia_vida': diaVida,
      'aves_pesadas': avesPesadas,
      'peso_promedio_g': pesoPromedioG,
      'uniformidad_pct': uniformidadPct,
      'cv_pct': cvPct,
      'peso_estandar_g': pesoEstandarG,
      if (observaciones != null) 'observaciones': observaciones,
      'sincronizado': sincronizado,
    };
  }

  factory PesajeBiometrico.fromMap(Map<String, dynamic> map) {
    return PesajeBiometrico(
      id: map['id_local'] ?? map['id'],
      uuid: map['uuid']?.toString() ?? '',
      loteId: map['lote_id'] is int ? map['lote_id'] : int.tryParse(map['lote_id']?.toString() ?? '1') ?? 1,
      fecha: map['fecha']?.toString() ?? '',
      diaVida: map['dia_vida'] is int ? map['dia_vida'] : int.tryParse(map['dia_vida']?.toString() ?? '1') ?? 1,
      avesPesadas: map['aves_pesadas'] is int ? map['aves_pesadas'] : int.tryParse(map['aves_pesadas']?.toString() ?? '100') ?? 100,
      pesoPromedioG: map['peso_promedio_g'] is num ? (map['peso_promedio_g'] as num).toDouble() : double.tryParse(map['peso_promedio_g']?.toString() ?? '0') ?? 0.0,
      uniformidadPct: map['uniformidad_pct'] is num ? (map['uniformidad_pct'] as num).toDouble() : double.tryParse(map['uniformidad_pct']?.toString() ?? '85') ?? 85.0,
      cvPct: map['cv_pct'] is num ? (map['cv_pct'] as num).toDouble() : double.tryParse(map['cv_pct']?.toString() ?? '7.2') ?? 7.2,
      pesoEstandarG: map['peso_estandar_g'] is num ? (map['peso_estandar_g'] as num).toDouble() : double.tryParse(map['peso_estandar_g']?.toString() ?? '2120') ?? 2120.0,
      observaciones: map['observaciones']?.toString(),
      sincronizado: map['sincronizado'] is int ? map['sincronizado'] : int.tryParse(map['sincronizado']?.toString() ?? '0') ?? 0,
    );
  }
}

/// 🥚 CLASE PRODUCCIÓN DE HUEVOS
class ProduccionHuevos {
  final int? id;
  final String uuid;
  final int loteId;
  final String fecha;
  final int huevosTotales;
  final int huevosComerciales;
  final int huevosRotos;
  final int huevosSucios;
  final int calibreJumbo;
  final int calibreAaa;
  final int calibreAa;
  final int calibreA;
  final int calibreB;
  final double posturaPct;
  final double unidadesHaugh;
  final int sincronizado;

  ProduccionHuevos({
    this.id,
    required this.uuid,
    required this.loteId,
    required this.fecha,
    required this.huevosTotales,
    required this.huevosComerciales,
    this.huevosRotos = 0,
    this.huevosSucios = 0,
    this.calibreJumbo = 0,
    this.calibreAaa = 0,
    this.calibreAa = 0,
    this.calibreA = 0,
    this.calibreB = 0,
    this.posturaPct = 94.5,
    this.unidadesHaugh = 88.0,
    this.sincronizado = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id_local': id,
      'uuid': uuid,
      'lote_id': loteId,
      'fecha': fecha,
      'huevos_totales': huevosTotales,
      'huevos_comerciales': huevosComerciales,
      'huevos_rotos': huevosRotos,
      'huevos_sucios': huevosSucios,
      'calibre_jumbo': calibreJumbo,
      'calibre_aaa': calibreAaa,
      'calibre_aa': calibreAa,
      'calibre_a': calibreA,
      'calibre_b': calibreB,
      'postura_pct': posturaPct,
      'unidades_haugh': unidadesHaugh,
      'sincronizado': sincronizado,
    };
  }

  factory ProduccionHuevos.fromMap(Map<String, dynamic> map) {
    return ProduccionHuevos(
      id: map['id_local'] ?? map['id'],
      uuid: map['uuid']?.toString() ?? '',
      loteId: map['lote_id'] is int ? map['lote_id'] : int.tryParse(map['lote_id']?.toString() ?? '1') ?? 1,
      fecha: map['fecha']?.toString() ?? '',
      huevosTotales: map['huevos_totales'] is int ? map['huevos_totales'] : int.tryParse(map['huevos_totales']?.toString() ?? '0') ?? 0,
      huevosComerciales: map['huevos_comerciales'] is int ? map['huevos_comerciales'] : int.tryParse(map['huevos_comerciales']?.toString() ?? '0') ?? 0,
      huevosRotos: map['huevos_rotos'] is int ? map['huevos_rotos'] : int.tryParse(map['huevos_rotos']?.toString() ?? '0') ?? 0,
      huevosSucios: map['huevos_sucios'] is int ? map['huevos_sucios'] : int.tryParse(map['huevos_sucios']?.toString() ?? '0') ?? 0,
      calibreJumbo: map['calibre_jumbo'] is int ? map['calibre_jumbo'] : int.tryParse(map['calibre_jumbo']?.toString() ?? '0') ?? 0,
      calibreAaa: map['calibre_aaa'] is int ? map['calibre_aaa'] : int.tryParse(map['calibre_aaa']?.toString() ?? '0') ?? 0,
      calibreAa: map['calibre_aa'] is int ? map['calibre_aa'] : int.tryParse(map['calibre_aa']?.toString() ?? '0') ?? 0,
      calibreA: map['calibre_a'] is int ? map['calibre_a'] : int.tryParse(map['calibre_a']?.toString() ?? '0') ?? 0,
      calibreB: map['calibre_b'] is int ? map['calibre_b'] : int.tryParse(map['calibre_b']?.toString() ?? '0') ?? 0,
      posturaPct: map['postura_pct'] is num ? (map['postura_pct'] as num).toDouble() : double.tryParse(map['postura_pct']?.toString() ?? '94.5') ?? 94.5,
      unidadesHaugh: map['unidades_haugh'] is num ? (map['unidades_haugh'] as num).toDouble() : double.tryParse(map['unidades_haugh']?.toString() ?? '88') ?? 88.0,
      sincronizado: map['sincronizado'] is int ? map['sincronizado'] : int.tryParse(map['sincronizado']?.toString() ?? '0') ?? 0,
    );
  }
}

/// 🏆 CLASE RENDIMIENTO ZOOTÉCNICO Y PODIO DE MEDALLAS
/// Calcula y ordena los galpones y lotes para otorgar:
/// - 🥇 Medalla de Oro al galpón con mayor eficiencia (IEP o Postura)
/// - 🥈 Medalla de Plata al segundo lugar
/// - 🥉 Medalla de Bronce al tercer lugar
class RendimientoGalpon {
  final Galpon galpon;
  final Lote lote;
  final int totalAves;
  final double ca; // Conversión alimenticia
  final int iep; // Índice de Eficiencia Productiva
  final double posturaPct;
  final double viabilidadPct;
  final int posicion; // 1, 2, 3...

  RendimientoGalpon({
    required this.galpon,
    required this.lote,
    required this.totalAves,
    required this.ca,
    required this.iep,
    required this.posturaPct,
    required this.viabilidadPct,
    this.posicion = 1,
  });

  String get medalla {
    if (posicion == 1) return '🥇';
    if (posicion == 2) return '🥈';
    if (posicion == 3) return '🥉';
    return '#$posicion';
  }

  /// 🏆 FUNCIÓN MATEMÁTICA: CALCULAR EL PODIO OFICIAL
  static List<RendimientoGalpon> calcular({
    required List<Galpon> galpones,
    required List<Lote> lotes,
  }) {
    final List<RendimientoGalpon> lista = [];

    for (var l in lotes) {
      if (l.estado != 'ACTIVO') continue;
      final g = galpones.firstWhere(
        (gal) => gal.id == l.galponId,
        orElse: () => Galpon(id: l.galponId, numero: 'Galpón ${l.galponId}', tipoSistema: 'Túnel', capacidadMaxima: 20000),
      );

      final viab = l.cantidadInicial > 0 ? (l.cantidadActual / l.cantidadInicial) * 100.0 : 100.0;
      final esEngorde = l.tipoAve == 'ENGORDE';

      // Simulación de IEP y CA según estirpe
      final caEstimada = esEngorde ? (l.lineaGenetica.contains('Cobb') ? 1.52 : 1.54) : 1.88;
      final iepEstimado = esEngorde ? (l.lineaGenetica.contains('Cobb') ? 374 : 368) : 0;
      final postura = esEngorde ? 0.0 : 94.6;

      lista.add(
        RendimientoGalpon(
          galpon: g,
          lote: l,
          totalAves: l.cantidadActual,
          ca: caEstimada,
          iep: iepEstimado,
          posturaPct: postura,
          viabilidadPct: viab,
        ),
      );
    }

    // Ordenar por IEP (engorde) o Postura (ponedoras)
    lista.sort((a, b) {
      if (a.lote.tipoAve == 'ENGORDE' && b.lote.tipoAve == 'ENGORDE') {
        return b.iep.compareTo(a.iep);
      }
      return b.posturaPct.compareTo(a.posturaPct);
    });

    return List.generate(lista.length, (i) {
      final r = lista[i];
      return RendimientoGalpon(
        galpon: r.galpon,
        lote: r.lote,
        totalAves: r.totalAves,
        ca: r.ca,
        iep: r.iep,
        posturaPct: r.posturaPct,
        viabilidadPct: r.viabilidadPct,
        posicion: i + 1,
      );
    });
  }
}
