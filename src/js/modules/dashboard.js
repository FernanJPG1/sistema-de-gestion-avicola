import { store } from '../state.js';
import { ChartEngine } from '../chart-engine.js';
import { icons } from '../icons.js';

export function renderDashboard(container) {
  const state = store.getState();
  const lotesEng = state.lotesEngorde || [];
  const lotesPon = state.lotesPonedoras || [];
  const galpones = state.galpones || [];

  // Cálculos zootécnicos dinámicos consolidados
  const totalAvesEngorde = lotesEng.reduce((acc, l) => acc + (l.avesVivas || 0), 0);
  const totalGallinasPonedoras = lotesPon.reduce((acc, l) => acc + (l.gallinasVivas || 0), 0);
  const totalAvesVivas = totalAvesEngorde + totalGallinasPonedoras;

  const totalIniciales = lotesEng.reduce((acc, l) => acc + (l.cantidadInicial || 0), 0) +
                         lotesPon.reduce((acc, l) => acc + (l.gallinasIniciales || 0), 0);
  const viabilidadGlobal = totalIniciales > 0 ? ((totalAvesVivas / totalIniciales) * 100).toFixed(1) : '100.0';

  const lote1Eng = lotesEng[0] || null;
  const caPromedio = lotesEng.length > 0 
    ? (lotesEng.reduce((acc, l) => acc + (l.caAcumulada || 0), 0) / lotesEng.length).toFixed(2)
    : '1.52';

  const ratioAguaPromedio = lote1Eng ? lote1Eng.ratioAguaAlimento : 1.74;

  const totalHuevosHoy = lotesPon.reduce((acc, l) => acc + (l.huevosHoy || 0), 0);
  const posturaPonderada = totalGallinasPonedoras > 0 
    ? ((totalHuevosHoy / totalGallinasPonedoras) * 100).toFixed(1)
    : '0.0';

  const iepPromedio = lotesEng.length > 0
    ? Math.round(lotesEng.reduce((acc, l) => acc + (l.iep || 0), 0) / lotesEng.length)
    : 368;

  const galponesActivos = galpones.filter(g => g.estado === 'ocupado').length;

  container.innerHTML = `
    <!-- BANNER DE ALERTAS CRÍTICAS -->
    ${state.alertasActivas.length > 0 ? `
      <div class="alerts-banner" id="dashboard-alert-banner">
        <div class="alerts-content">
          <span class="alerts-icon">${icons.alert(20)}</span>
          <div class="alerts-text">
            <strong>${state.alertasActivas[0].titulo}:</strong> ${state.alertasActivas[0].descripcion}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <a class="alerts-action" id="btn-ver-modulo-alerta">Ir al Módulo ${icons.arrowRight(14)}</a>
          <button class="btn btn-secondary btn-sm" id="btn-descartar-alerta" style="padding: 4px 10px; font-size: 0.75rem;">✕ Descartar</button>
        </div>
      </div>
    ` : ''}

    <!-- KPI COMMAND CENTER CARDS -->
    <div class="kpi-grid">
      <!-- 1. Total Aves Vivas -->
      <div class="kpi-card" style="--card-accent: var(--siga-green-primary);">
        <div class="kpi-header">
          <span class="kpi-title">Aves en Producción</span>
          <div class="kpi-icon-badge">${icons.bird(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">${totalAvesVivas.toLocaleString()}</span>
          <span class="kpi-unit">aves</span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-trend-positive">● ${viabilidadGlobal}% Viabilidad</span> en ${galponesActivos} galpones
        </div>
      </div>

      <!-- 2. Conversión Alimenticia Promedio -->
      <div class="kpi-card" style="--card-accent: var(--siga-gold-primary);">
        <div class="kpi-header">
          <span class="kpi-title">Conversión Acumulada (CA)</span>
          <div class="kpi-icon-badge" style="color:var(--siga-gold-primary); background:var(--siga-gold-soft);">${icons.scale(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">${caPromedio}</span>
          <span class="kpi-unit">vs 1.58 meta</span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-trend-positive">&darr; Óptimo</span> promedio ponderado
        </div>
      </div>

      <!-- 3. Ratio Agua / Alimento -->
      <div class="kpi-card" style="--card-accent: var(--siga-blue-telemetry);">
        <div class="kpi-header">
          <span class="kpi-title">Ratio Agua / Alimento</span>
          <div class="kpi-icon-badge" style="color:var(--siga-blue-telemetry); background:var(--siga-blue-soft);">${icons.droplet(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">${ratioAguaPromedio}</span>
          <span class="kpi-unit">L / kg</span>
        </div>
        <div class="kpi-subtext">
          <span class="${ratioAguaPromedio >= 1.6 && ratioAguaPromedio <= 1.85 ? 'kpi-trend-positive' : 'kpi-trend-warning'}">
            ● ${ratioAguaPromedio >= 1.6 && ratioAguaPromedio <= 1.85 ? 'Rango Normal' : 'Requiere Revisión'}
          </span> (1.60 - 1.85)
        </div>
      </div>

      <!-- 4. Postura Diaria Ponedoras -->
      <div class="kpi-card" style="--card-accent: var(--siga-gold-light);">
        <div class="kpi-header">
          <span class="kpi-title">Postura Gallinas Hoy</span>
          <div class="kpi-icon-badge" style="color:var(--siga-gold-dark); background:var(--siga-gold-soft);">${icons.egg(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">${posturaPonderada}%</span>
          <span class="kpi-unit">postura</span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-trend-positive">${totalHuevosHoy.toLocaleString()} huevos</span> clasificados
        </div>
      </div>

      <!-- 5. Índice Eficiencia Productiva (IEP) -->
      <div class="kpi-card" style="--card-accent: var(--siga-green-light);">
        <div class="kpi-header">
          <span class="kpi-title">Eficiencia Zootécnica (IEP)</span>
          <div class="kpi-icon-badge">${icons.activity(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">${iepPromedio}</span>
          <span class="kpi-unit">puntos</span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-trend-positive">&gt; 350 Sobresaliente</span> clase mundial
        </div>
      </div>
    </div>

    <!-- SECCIÓN DE GRÁFICOS INTERACTIVOS EN TIEMPO REAL -->
    <div class="charts-grid">
      <!-- Gráfico 1: Curva de Crecimiento vs Estándar -->
      <div class="card-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Curva de Crecimiento Zootécnico (Día 0 a 42)</h3>
            <p class="panel-subtitle">
              ${lote1Eng ? `${lote1Eng.codigo} (${lote1Eng.lineaGenetica}) vs Estándar con Banda &plusmn;8%` : 'Sin lote activo'}
            </p>
          </div>
          <div class="panel-actions">
            ${lote1Eng ? `<span class="badge badge-success">Día ${lote1Eng.edadDias}: ${lote1Eng.pesoPromedioG.toLocaleString()}g</span>` : ''}
          </div>
        </div>
        <div style="position: relative; width: 100%;">
          <canvas id="canvas-crecimiento" style="width: 100%; display: block;"></canvas>
        </div>
      </div>

      <!-- Gráfico 2: Telemetría Ratio Agua/Alimento -->
      <div class="card-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Detector de Anomalías Hídricas</h3>
            <p class="panel-subtitle">Litros de agua por kg de alimento (Monitoreo continuo)</p>
          </div>
          <div class="panel-actions">
            <span class="badge badge-info">Sensado en línea</span>
          </div>
        </div>
        <div style="position: relative; width: 100%;">
          <canvas id="canvas-ratio-agua" style="width: 100%; display: block;"></canvas>
        </div>
      </div>
    </div>

    <!-- TABLA DINÁMICA DE ESTADO OPERATIVO DE GALPONES -->
    <div class="card-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Supervisión Integral de Galpones &mdash; ${state.currentFarm.name}</h3>
          <p class="panel-subtitle">Estado operacional en tiempo real: engorde, postura y descansos sanitarios ICA</p>
        </div>
        <div class="panel-actions">
          <button class="btn btn-primary btn-sm" id="btn-nuevo-lote-dash">${icons.plus(14)} Ingresar Lote</button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="siga-table">
          <thead>
            <tr>
              <th>Galpón</th>
              <th>Tecnología / Tipo</th>
              <th>Lote Asignado</th>
              <th>Línea Genética</th>
              <th>Edad / Ciclo</th>
              <th>Población</th>
              <th>Indicador Clave</th>
              <th>Estado Sanitario</th>
              <th>Acción Rápida</th>
            </tr>
          </thead>
          <tbody>
            ${galpones.map(g => {
              if (g.estado === 'ocupado' && g.loteId) {
                const eng = lotesEng.find(l => l.id === g.loteId);
                if (eng) {
                  return `
                    <tr>
                      <td><strong>${g.codigo}</strong></td>
                      <td>${formatearTipoTecnologia(g.tipo)}</td>
                      <td><code>${eng.codigo}</code></td>
                      <td>${eng.lineaGenetica}</td>
                      <td>Día ${eng.edadDias} / 42d</td>
                      <td><strong>${eng.avesVivas.toLocaleString()}</strong> aves</td>
                      <td><span class="badge badge-success">CA ${eng.caAcumulada} &bull; IEP ${eng.iep}</span></td>
                      <td>
                        ${eng.bloqueoFarmacologico 
                          ? `<span class="badge badge-danger">${icons.lock(12)} Retiro (${eng.diasRetiroPendientes}d)</span>` 
                          : `<span class="badge badge-success">${icons.check(12)} Apto Sacrificio</span>`}
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-sm btn-nav-lote" data-nav="#engorde" data-lote="${eng.id}">Gestionar</button>
                      </td>
                    </tr>
                  `;
                }

                const pon = lotesPon.find(l => l.id === g.loteId);
                if (pon) {
                  return `
                    <tr>
                      <td><strong>${g.codigo}</strong></td>
                      <td>${formatearTipoTecnologia(g.tipo)}</td>
                      <td><code>${pon.codigo}</code></td>
                      <td>${pon.lineaGenetica}</td>
                      <td>Semana ${pon.edadSemanas}</td>
                      <td><strong>${pon.gallinasVivas.toLocaleString()}</strong> aves</td>
                      <td><span class="badge badge-warning">${pon.posturaPct}% Postura</span></td>
                      <td><span class="badge badge-success">${icons.check(12)} Apto Comercial</span></td>
                      <td>
                        <button class="btn btn-secondary btn-sm btn-nav-lote" data-nav="#ponedoras" data-lote="${pon.id}">Gestionar</button>
                      </td>
                    </tr>
                  `;
                }
              }

              if (g.estado === 'vacio_sanitario') {
                const vacio = state.vaciosSanitarios.find(v => v.galponId === g.id);
                const diasInfo = vacio ? `Día ${vacio.diasTranscurridos} de ${vacio.diasRequeridosIca}` : 'En Higienización';
                const salmonellaOk = vacio && vacio.etapas.some(e => e.estado === 'negativo_aprobado');

                return `
                  <tr style="background: rgba(212, 163, 89, 0.04);">
                    <td><strong>${g.codigo}</strong></td>
                    <td>${formatearTipoTecnologia(g.tipo)}</td>
                    <td><em style="color:var(--siga-gold-primary);">En Vacío Sanitario</em></td>
                    <td>&mdash;</td>
                    <td>${diasInfo}</td>
                    <td>0 aves</td>
                    <td><span class="badge badge-warning">Descanso Sanitario</span></td>
                    <td>
                      ${salmonellaOk 
                        ? `<span class="badge badge-info">Microbiología Negativo</span>` 
                        : `<span class="badge badge-warning">En Desinfección</span>`}
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm btn-nav-lote" data-nav="#bioseguridad">Checklist ICA</button>
                    </td>
                  </tr>
                `;
              }

              // Disponible
              return `
                <tr style="background: rgba(34, 197, 94, 0.04);">
                  <td><strong>${g.codigo}</strong></td>
                  <td>${formatearTipoTecnologia(g.tipo)}</td>
                  <td><span style="color:#15803D; font-weight:700;">Galpón Listo</span></td>
                  <td>&mdash;</td>
                  <td>Desinfectado</td>
                  <td>0 aves</td>
                  <td><span class="badge badge-success">Apto para Carga</span></td>
                  <td><span class="badge badge-success">${icons.check(12)} Sanidad OK</span></td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-asignar-galpon" data-galpon="${g.id}">Asignar Lote</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Renderizar gráficos con ChartEngine
  setTimeout(() => {
    if (lote1Eng) {
      const dataEstandarRoss = state.curvasGeneticas[lote1Eng.lineaGenetica] || state.curvasGeneticas['Ross 308 AP'];
      const dataRealRoss = [
        { dia: 0, pesoG: 42 },
        { dia: 7, pesoG: 202 },
        { dia: 14, pesoG: 525 },
        { dia: 21, pesoG: 1060 },
        { dia: 28, pesoG: 1810 },
        { dia: lote1Eng.edadDias, pesoG: lote1Eng.pesoPromedioG }
      ];
      ChartEngine.renderCurvaCrecimiento('canvas-crecimiento', dataRealRoss, dataEstandarRoss);

      const dataRatio = lote1Eng.historialDiario && lote1Eng.historialDiario.length > 0
        ? lote1Eng.historialDiario.map(h => ({ dia: h.dia, ratio: h.ratio }))
        : [
            { dia: 26, ratio: 1.70 },
            { dia: 27, ratio: 1.72 },
            { dia: 28, ratio: 1.71 },
            { dia: 29, ratio: 1.75 },
            { dia: 30, ratio: 1.73 },
            { dia: 31, ratio: 1.72 },
            { dia: 32, ratio: 1.74 }
          ];
      ChartEngine.renderRatioAguaAlimento('canvas-ratio-agua', dataRatio);
    }
  }, 50);

  // Bindings y Eventos
  document.getElementById('btn-descartar-alerta')?.addEventListener('click', () => {
    if (state.alertasActivas.length > 0) {
      store.descartarAlerta(state.alertasActivas[0].id);
      renderDashboard(container);
    }
  });

  document.getElementById('btn-ver-modulo-alerta')?.addEventListener('click', () => {
    const alerta = state.alertasActivas[0];
    if (alerta && alerta.modulo) {
      window.location.hash = `#${alerta.modulo}`;
    } else {
      window.location.hash = '#bioseguridad';
    }
  });

  document.querySelectorAll('.btn-nav-lote').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNav = btn.dataset.nav;
      if (targetNav) window.location.hash = targetNav;
    });
  });

  document.querySelectorAll('.btn-asignar-galpon').forEach(btn => {
    btn.addEventListener('click', () => {
      abrirModalIngresarLote(btn.dataset.galpon);
    });
  });

  document.getElementById('btn-nuevo-lote-dash')?.addEventListener('click', () => {
    abrirModalIngresarLote();
  });
}

function formatearTipoTecnologia(tipo) {
  const map = {
    tunel_presion_negativa: 'Túnel Presión Negativa',
    ambiente_natural_cortinas: 'Ambiente Natural con Cortinas',
    dark_house_combi: 'Dark House Combi Automatizado',
    postura_piso_nido_auto: 'Postura Piso con Nidal Auto',
    postura_pastoreo_free_range: 'Pastoreo Libre (Free-Range)'
  };
  return map[tipo] || tipo;
}

export function abrirModalIngresarLote(galponPreseleccionado = null) {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Ingresar Nuevo Lote de Producción';

  const galponesOptions = state.galpones.map(g => `
    <option value="${g.id}" ${g.id === galponPreseleccionado ? 'selected' : ''}>
      ${g.codigo} (${g.capacidad.toLocaleString()} aves máx &bull; Estado: ${g.estado.toUpperCase()})
    </option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-nuevo-lote">
      <div class="tabs-header" style="margin-bottom: 18px;">
        <button type="button" class="tab-btn active" id="tab-tipo-engorde">Pollo de Engorde</button>
        <button type="button" class="tab-btn" id="tab-tipo-ponedora">Gallina Ponedora</button>
      </div>

      <input type="hidden" id="nuevo-tipo-produccion" value="engorde" />

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Código del Lote</label>
          <input type="text" class="form-control" id="nuevo-lote-codigo" value="PE-2026-095" required />
        </div>
        <div class="form-group">
          <label class="form-label">Galpón Destino</label>
          <select class="form-control" id="nuevo-lote-galpon" required>
            ${galponesOptions}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Línea Genética</label>
          <select class="form-control" id="nuevo-lote-linea">
            <option value="Ross 308 AP">Ross 308 AP</option>
            <option value="Cobb 500">Cobb 500</option>
            <option value="Hubbard Efficiency Plus">Hubbard Efficiency Plus</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Cantidad Inicial de Aves</label>
          <input type="number" class="form-control" id="nuevo-lote-cantidad" min="100" max="40000" value="18000" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Fecha de Ingreso / Alojamiento</label>
          <input type="date" class="form-control" id="nuevo-lote-fecha" value="${new Date().toISOString().split('T')[0]}" required />
        </div>
        <div class="form-group" id="group-edad-inicial">
          <label class="form-label">Edad Inicial (Días)</label>
          <input type="number" class="form-control" id="nuevo-lote-edad" min="1" max="50" value="1" required />
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icons.check(14)} Crear Lote y Registrar</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  const tabEngorde = document.getElementById('tab-tipo-engorde');
  const tabPonedora = document.getElementById('tab-tipo-ponedora');
  const inputTipo = document.getElementById('nuevo-tipo-produccion');
  const selectLinea = document.getElementById('nuevo-lote-linea');
  const inputCodigo = document.getElementById('nuevo-lote-codigo');
  const groupEdad = document.getElementById('group-edad-inicial');

  tabEngorde.addEventListener('click', () => {
    tabEngorde.classList.add('active');
    tabPonedora.classList.remove('active');
    inputTipo.value = 'engorde';
    inputCodigo.value = `PE-2026-0${Math.floor(Math.random() * 80 + 20)}`;
    selectLinea.innerHTML = `
      <option value="Ross 308 AP">Ross 308 AP</option>
      <option value="Cobb 500">Cobb 500</option>
      <option value="Hubbard Efficiency Plus">Hubbard Efficiency Plus</option>
    `;
    groupEdad.innerHTML = `
      <label class="form-label">Edad Inicial (Días)</label>
      <input type="number" class="form-control" id="nuevo-lote-edad" min="1" max="50" value="1" required />
    `;
  });

  tabPonedora.addEventListener('click', () => {
    tabPonedora.classList.add('active');
    tabEngorde.classList.remove('active');
    inputTipo.value = 'ponedora';
    inputCodigo.value = `GP-2026-0${Math.floor(Math.random() * 80 + 30)}`;
    selectLinea.innerHTML = `
      <option value="Lohmann Brown-Classic">Lohmann Brown-Classic</option>
      <option value="Hy-Line W-36">Hy-Line W-36</option>
      <option value="ISA Brown">ISA Brown</option>
      <option value="Novogen Brown">Novogen Brown</option>
    `;
    groupEdad.innerHTML = `
      <label class="form-label">Edad Inicial (Semanas)</label>
      <input type="number" class="form-control" id="nuevo-lote-edad" min="16" max="90" value="18" required />
    `;
  });

  document.getElementById('form-nuevo-lote')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = inputTipo.value;
    const codigo = inputCodigo.value.trim();
    const galponId = document.getElementById('nuevo-lote-galpon').value;
    const linea = selectLinea.value;
    const cantidad = parseInt(document.getElementById('nuevo-lote-cantidad').value, 10);
    const fecha = document.getElementById('nuevo-lote-fecha').value;
    const edad = parseInt(document.getElementById('nuevo-lote-edad').value, 10);

    try {
      if (tipo === 'engorde') {
        store.crearLoteEngorde({
          codigo,
          galponId,
          lineaGenetica: linea,
          fechaIngreso: fecha,
          edadDias: edad,
          cantidadInicial: cantidad,
          pesoInicialG: 42
        });
        window.showToast(`Lote de Engorde ${codigo} creado con éxito`, 'success');
      } else {
        store.crearLotePonedoras({
          codigo,
          galponId,
          lineaGenetica: linea,
          fechaAlojamiento: fecha,
          edadSemanas: edad,
          gallinasIniciales: cantidad
        });
        window.showToast(`Lote de Ponedoras ${codigo} creado con éxito`, 'success');
      }

      modal.classList.remove('active');
      renderDashboard(document.getElementById('main-content-area'));
    } catch (err) {
      window.showToast(err.message, 'error');
    }
  });
}
