import { store } from '../state.js';
import { ChartEngine } from '../chart-engine.js';
import { icons } from '../icons.js';
import { abrirModalIngresarLote } from './dashboard.js';

let loteSeleccionadoId = 'PE-2026-088';
let precioVentaKiloSim = 6200;
let costoAlimentoTonSim = 2800000;

export function renderEngorde(container) {
  const state = store.getState();
  const lotes = state.lotesEngorde || [];

  if (lotes.length > 0 && !lotes.some(l => l.id === loteSeleccionadoId)) {
    loteSeleccionadoId = lotes[0].id;
  }

  const loteActivo = lotes.find(l => l.id === loteSeleccionadoId) || lotes[0] || null;

  container.innerHTML = `
    <!-- ENCABEZADO DE SECCIÓN -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">Gestión Científica de Pollos de Engorde</h2>
        <p style="color: var(--text-muted); font-size: 0.82rem;">Monitoreo de biometría, ganancia diaria (GDP), curvas de estirpe y algoritmo de saca óptima.</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="btn-nuevo-lote-engorde">${icons.plus(14)} Nuevo Lote</button>
        <button class="btn btn-secondary" id="btn-modal-muestreo">${icons.scale(14)} Muestreo Biométrico (CV%)</button>
        <button class="btn btn-secondary" id="btn-modal-consumo">${icons.wheat(14)} Consumo Diario</button>
        <button class="btn btn-danger" id="btn-modal-bajas">${icons.skull(14)} Bajas Diarias</button>
      </div>
    </div>

    <!-- TARJETAS DETALLADAS DE LOTES -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px; margin-bottom: 30px;">
      ${lotes.length === 0 ? `
        <div class="card-panel" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 16px;">No hay lotes de engorde activos en este momento.</p>
          <button class="btn btn-primary" id="btn-crear-primer-lote">${icons.plus(14)} Ingresar Primer Lote</button>
        </div>
      ` : lotes.map(l => {
        const esSeleccionado = l.id === loteSeleccionadoId;
        return `
          <div class="card-panel ${esSeleccionado ? 'card-panel-selected' : ''}" style="border-top: 4px solid var(--siga-green-primary); position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
              <div>
                <span class="badge badge-info" style="margin-bottom: 6px;">${l.galponId}</span>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); cursor: pointer;" class="btn-seleccionar-lote" data-lote="${l.id}">
                  ${l.codigo} ${esSeleccionado ? '★' : ''}
                </h3>
                <p style="color: var(--siga-gold-primary); font-weight: 700; font-size: 0.85rem;">${l.lineaGenetica}</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 1.8rem; font-weight: 900; color: var(--text-main);">Día ${l.edadDias}</span>
                <p style="color: var(--text-muted); font-size: 0.75rem;">de 42 días ciclo</p>
              </div>
            </div>

            <!-- Métricas Principales -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
              <div>
                <span style="font-size: 0.72rem; color: var(--text-muted); display: block; font-weight:600;">PESO MEDIO</span>
                <strong style="font-size: 1.15rem; color: var(--text-main);">${l.pesoPromedioG.toLocaleString()}g</strong>
                <span style="font-size: 0.72rem; color: var(--siga-green-light); display: block; font-weight:700;">+${l.gdpGramos}g/día</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: var(--text-muted); display: block; font-weight:600;">CONVERSIÓN</span>
                <strong style="font-size: 1.15rem; color: var(--siga-gold-primary);">${l.caAcumulada}</strong>
                <span style="font-size: 0.72rem; color: var(--siga-green-light); display: block; font-weight:700;">Meta: ${l.caMeta}</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: var(--text-muted); display: block; font-weight:600;">POBLACIÓN</span>
                <strong style="font-size: 1.15rem; color: var(--text-main);">${l.avesVivas.toLocaleString()}</strong>
                <span style="font-size: 0.72rem; color: #FB7185; display: block; font-weight:700;">Mort: ${l.mortalidadAcumPct}%</span>
              </div>
            </div>

            <!-- Datos de Uniformidad y CV% del último pesaje -->
            ${l.ultimoMuestreo ? `
              <div style="background: var(--siga-green-soft); border: 1px solid var(--siga-green-border); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700;">
                  <span style="color: var(--siga-green-light);">Uniformidad: ${l.ultimoMuestreo.uniformidadPct}% (&plusmn;10%)</span>
                  <span style="color: var(--siga-gold-light);">CV%: ${l.ultimoMuestreo.cvPct}% (&plusmn;${l.ultimoMuestreo.desviacionG}g)</span>
                </div>
              </div>
            ` : ''}

            <!-- Telemetría Diaria y Retiro -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 0.8rem;">
              <span style="color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                ${icons.droplet(13)} Ratio Agua/Alim: <strong style="color:${l.ratioAguaAlimento >= 1.6 && l.ratioAguaAlimento <= 1.85 ? 'var(--siga-green-light)' : '#FB7185'};">${l.ratioAguaAlimento}</strong> L/kg
              </span>
              <div>
                ${l.bloqueoFarmacologico ? `
                  <span class="badge badge-danger">${icons.lock(11)} Retiro: ${l.diasRetiroPendientes}d (${l.medicamentoActivo || 'Fármaco'})</span>
                ` : `
                  <span class="badge badge-success">${icons.check(11)} Apto Sacrificio / 0d Retiro</span>
                `}
              </div>
            </div>

            <!-- Botones de Acción Operativa del Lote -->
            <div style="display: flex; justify-content: space-between; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm btn-simular-saca" data-lote="${l.id}">${icons.target(13)} Simular Saca</button>
              <button class="btn btn-secondary btn-sm btn-pesaje-rapido" data-lote="${l.id}">${icons.scale(13)} Pesar</button>
              <button class="btn btn-secondary btn-sm btn-consumo-rapido" data-lote="${l.id}">${icons.wheat(13)} Consumo</button>
              <button class="btn btn-danger btn-sm btn-finalizar-lote" data-lote="${l.id}" title="Finalizar lote y despachar a planta de sacrificio">Despachar</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- PANEL DE BIOMETRÍA ESTADÍSTICA (HISTOGRAMA DE PESO) -->
    ${loteActivo ? `
      <div class="card-panel" style="margin-bottom: 30px;">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Muestreo Biométrico de Pesaje &mdash; Campana de Gauss (${loteActivo.codigo})</h3>
            <p class="panel-subtitle">
              Muestra: ${loteActivo.ultimoMuestreo ? loteActivo.ultimoMuestreo.avesMuestreadas : 100} aves pesadas &bull; 
              Media: ${loteActivo.pesoPromedioG.toLocaleString()}g &bull; 
              Coeficiente de Variación: ${loteActivo.ultimoMuestreo ? loteActivo.ultimoMuestreo.cvPct : 7.2}%
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="badge badge-success">Uniformidad: ${loteActivo.ultimoMuestreo ? loteActivo.ultimoMuestreo.uniformidadPct : 85}% (&plusmn;10% Media)</span>
            <select class="form-control" id="select-lote-biometria" style="width: auto; padding: 4px 8px; font-size: 0.8rem;">
              ${lotes.map(l => `<option value="${l.id}" ${l.id === loteActivo.id ? 'selected' : ''}>${l.codigo} (${l.galponId})</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="position: relative; width: 100%;">
          <canvas id="canvas-histograma" style="width: 100%; display: block;"></canvas>
        </div>
      </div>
    ` : ''}

    <!-- SIMULADOR INTERACTIVO DE SACA ÓPTIMA ECONÓMICA -->
    <div class="card-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Algoritmo de Saca Óptima Económica en Tiempo Real</h3>
          <p class="panel-subtitle">Punto de inflexión marginal: cuando el costo del alimento consumido supera el valor de la carne ganada por metro cuadrado.</p>
        </div>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <label style="font-size: 0.75rem; color: var(--text-muted); font-weight:600;">Precio Venta ($/kg):</label>
            <input type="number" id="sim-precio-kg" value="${precioVentaKiloSim}" step="100" style="width: 90px; padding: 4px 8px; background:var(--bg-input); border:1px solid var(--border-subtle); color:var(--text-main); border-radius:4px; font-weight:700;" />
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <label style="font-size: 0.75rem; color: var(--text-muted); font-weight:600;">Alimento ($/Ton):</label>
            <input type="number" id="sim-costo-alimento" value="${costoAlimentoTonSim}" step="50000" style="width: 110px; padding: 4px 8px; background:var(--bg-input); border:1px solid var(--border-subtle); color:var(--text-main); border-radius:4px; font-weight:700;" />
          </div>
          <button class="btn btn-primary btn-sm" id="btn-recalcular-saca">Recalcular</button>
        </div>
      </div>

      <div id="contenedor-resultado-saca">
        <!-- Renderizado dinámico del cálculo de saca -->
      </div>

      <div style="margin-top: 20px; position: relative; width: 100%;">
        <canvas id="canvas-saca-curva" style="width: 100%; display: block;"></canvas>
      </div>
    </div>
  `;

  // Renderizar simulador de saca
  actualizarSimulacionSaca(loteActivo);

  // Renderizar Gráfico Histograma
  setTimeout(() => {
    if (loteActivo && loteActivo.ultimoMuestreo) {
      ChartEngine.renderHistogramaPesaje('canvas-histograma', loteActivo.ultimoMuestreo);
    }
  }, 60);

  // Bindings
  document.getElementById('btn-nuevo-lote-engorde')?.addEventListener('click', () => {
    abrirModalIngresarLote();
  });
  document.getElementById('btn-crear-primer-lote')?.addEventListener('click', () => {
    abrirModalIngresarLote();
  });

  document.getElementById('btn-modal-bajas')?.addEventListener('click', () => {
    abrirModalBajas(loteActivo ? loteActivo.id : null);
  });
  document.getElementById('btn-modal-muestreo')?.addEventListener('click', () => {
    abrirModalMuestreo(loteActivo ? loteActivo.id : null);
  });
  document.getElementById('btn-modal-consumo')?.addEventListener('click', () => {
    abrirModalConsumo(loteActivo ? loteActivo.id : null);
  });

  document.querySelectorAll('.btn-pesaje-rapido').forEach(btn => {
    btn.addEventListener('click', () => abrirModalMuestreo(btn.dataset.lote));
  });
  document.querySelectorAll('.btn-consumo-rapido').forEach(btn => {
    btn.addEventListener('click', () => abrirModalConsumo(btn.dataset.lote));
  });

  document.querySelectorAll('.btn-seleccionar-lote').forEach(el => {
    el.addEventListener('click', () => {
      loteSeleccionadoId = el.dataset.lote;
      renderEngorde(container);
    });
  });

  document.getElementById('select-lote-biometria')?.addEventListener('change', (e) => {
    loteSeleccionadoId = e.target.value;
    renderEngorde(container);
  });

  document.querySelectorAll('.btn-simular-saca').forEach(btn => {
    btn.addEventListener('click', () => {
      loteSeleccionadoId = btn.dataset.lote;
      const lote = lotes.find(l => l.id === loteSeleccionadoId);
      actualizarSimulacionSaca(lote);
      window.scrollTo({ top: document.getElementById('contenedor-resultado-saca').offsetTop - 100, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.btn-finalizar-lote').forEach(btn => {
    btn.addEventListener('click', () => {
      abrirModalFinalizarLote(btn.dataset.lote);
    });
  });

  document.getElementById('btn-recalcular-saca')?.addEventListener('click', () => {
    precioVentaKiloSim = parseFloat(document.getElementById('sim-precio-kg').value) || 6200;
    costoAlimentoTonSim = parseFloat(document.getElementById('sim-costo-alimento').value) || 2800000;
    actualizarSimulacionSaca(loteActivo);
  });
}

function actualizarSimulacionSaca(lote) {
  if (!lote) return;
  const container = document.getElementById('contenedor-resultado-saca');
  if (!container) return;

  const resultado = store.simularSacaOptima(lote.id, precioVentaKiloSim, costoAlimentoTonSim);

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center;">
      <div style="background: var(--bg-surface); padding: 20px; border-radius: var(--radius-md); border-left: 4px solid var(--siga-gold-primary);">
        <h4 style="font-size: 1.05rem; color: var(--text-main); margin-bottom: 8px;">Ventana de Sacrificio Óptima para ${lote.codigo}</h4>
        <p style="font-size: 2.2rem; font-weight: 900; color: var(--siga-gold-primary); margin-bottom: 6px;">Día ${resultado.diaOptimo}</p>
        <p style="color: var(--text-secondary); font-size: 0.84rem;">
          En este día se maximiza el margen neto por metro cuadrado ($${resultado.margenOptimoM2.toLocaleString()} COP/m²). Más allá del día ${resultado.diaOptimo + 1}, el incremento del consumo de mantenimiento deteriora el retorno marginal.
        </p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;">
          <span style="color: var(--text-muted); font-size: 0.85rem;">Peso Proyectado Día ${resultado.diaOptimo}:</span>
          <strong style="color: var(--text-main);">${resultado.pesoOptimoG.toLocaleString()} gramos</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;">
          <span style="color: var(--text-muted); font-size: 0.85rem;">Utilidad Neta Proyectada Galpón:</span>
          <strong style="color: var(--siga-green-light);">$${resultado.margenTotalGalpon.toLocaleString()} COP</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;">
          <span style="color: var(--text-muted); font-size: 0.85rem;">Ingreso Bruto Total Estimado:</span>
          <strong style="color: var(--siga-gold-primary);">$${Math.round((resultado.pesoOptimoG / 1000) * lote.avesVivas * precioVentaKiloSim).toLocaleString()} COP</strong>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    ChartEngine.renderCurvaSacaOptima('canvas-saca-curva', resultado.proyeccion, resultado.diaOptimo);
  }, 50);
}

function abrirModalBajas(lotePreseleccionado = null) {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Registrar Bajas Diarias (Mortalidad)';
  const lotesOptions = state.lotesEngorde.map(l => `
    <option value="${l.id}" ${l.id === lotePreseleccionado ? 'selected' : ''}>
      ${l.codigo} (${l.galponId} &bull; ${l.lineaGenetica})
    </option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-registro-bajas">
      <div class="form-group">
        <label class="form-label">Seleccionar Lote Activo</label>
        <select class="form-control" id="modal-lote-id">
          ${lotesOptions}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cantidad de Aves Muertas</label>
          <input type="number" class="form-control" id="modal-cantidad-bajas" min="1" max="500" value="4" required />
        </div>
        <div class="form-group">
          <label class="form-label">Causa Principal de Mortalidad</label>
          <select class="form-control" id="modal-causa-bajas">
            <option value="Respiratoria">Problemas Respiratorios / Aerosaculitis</option>
            <option value="Digestiva">Enteritis / Problemas Digestivos</option>
            <option value="Sindrome_Ascitico">Síndrome Ascítico (Edema pulmonar)</option>
            <option value="Muerte_Subita">Síndrome de Muerte Súbita (Infarto)</option>
            <option value="Locomotor">Trastorno Locomotor / Patas</option>
            <option value="Otras">Otras / Descarte mecánico</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Observaciones Clínicas o Necropsia</label>
        <textarea class="form-control" id="modal-obs-bajas" rows="2" placeholder="Hallazgos macroscópicos, sacos aéreos, contenido cecal..."></textarea>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-danger">Confirmar Registro de Bajas</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('form-registro-bajas')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const loteId = document.getElementById('modal-lote-id').value;
    const cant = parseInt(document.getElementById('modal-cantidad-bajas').value, 10);
    const causa = document.getElementById('modal-causa-bajas').value;
    const obs = document.getElementById('modal-obs-bajas').value;

    store.registrarBajas(loteId, cant, causa, obs);
    modal.classList.remove('active');
    window.showToast(`Se registraron ${cant} bajas en ${loteId} (${causa})`, 'warning');
    renderEngorde(document.getElementById('main-content-area'));
  });
}

function abrirModalMuestreo(lotePreseleccionado = null) {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Muestreo Biométrico de Pesaje (Cálculo CV% y Uniformidad)';
  const lotesOptions = state.lotesEngorde.map(l => `
    <option value="${l.id}" ${l.id === lotePreseleccionado ? 'selected' : ''}>
      ${l.codigo} (${l.galponId})
    </option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-muestreo">
      <div class="form-group">
        <label class="form-label">Lote a Evaluar</label>
        <select class="form-control" id="muestreo-lote">
          ${lotesOptions}
        </select>
      </div>

      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
        Ingresa los pesos individuales (en gramos, separados por coma) o presiona "Capturar de Báscula BLE" para simular muestreo de campo:
      </p>

      <div class="form-group">
        <textarea class="form-control" id="pesajes-input" rows="4" style="font-family: var(--font-mono); font-size: 0.85rem;">2150, 2200, 2180, 2140, 2220, 2190, 2170, 2250, 2120, 2160, 2210, 2185, 2175, 2230, 2110, 2260, 2195, 2180, 2145, 2205</textarea>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 16px;">
        <button type="button" class="btn btn-secondary btn-sm" id="btn-ble-simulate">Capturar de Báscula BLE (50 aves)</button>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-ble-simulate-100">Muestra Rápida (100 aves)</button>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">Calcular Estadísticas Zootécnicas</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  const generarMuestra = (n, mediaRef = 2180) => {
    const weights = [];
    for (let i = 0; i < n; i++) {
      const u = Math.random() + Math.random() + Math.random() + Math.random() - 2;
      weights.push(Math.round(mediaRef + u * 80));
    }
    document.getElementById('pesajes-input').value = weights.join(', ');
    window.showToast(`Capturados ${n} pesajes vía Bluetooth Low Energy`, 'success');
  };

  document.getElementById('btn-ble-simulate')?.addEventListener('click', () => generarMuestra(50));
  document.getElementById('btn-ble-simulate-100')?.addEventListener('click', () => generarMuestra(100));

  document.getElementById('form-muestreo')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const loteId = document.getElementById('muestreo-lote').value;
    const raw = document.getElementById('pesajes-input').value;
    const array = raw.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x) && x > 0);

    if (array.length < 5) {
      window.showToast('Ingresa al menos 5 pesajes para el cálculo estadístico', 'warning');
      return;
    }

    const res = store.registrarMuestreoPesaje(loteId, array);
    modal.classList.remove('active');
    window.showToast(`Pesaje ${loteId}: Media ${res.mediaG}g | CV ${res.cvPct}% | Uniformidad ${res.uniformidadPct}%`, 'success');
    renderEngorde(document.getElementById('main-content-area'));
  });
}

function abrirModalConsumo(lotePreseleccionado = null) {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Registrar Consumo Diario (Agua y Alimento)';
  const lotesOptions = state.lotesEngorde.map(l => `
    <option value="${l.id}" ${l.id === lotePreseleccionado ? 'selected' : ''}>
      ${l.codigo} (${l.galponId})
    </option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-consumo">
      <div class="form-group">
        <label class="form-label">Lote Activo</label>
        <select class="form-control" id="consumo-lote">
          ${lotesOptions}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Alimento Entregado Hoy (Kg)</label>
          <input type="number" class="form-control" id="consumo-alimento" value="3150" min="10" required />
        </div>
        <div class="form-group">
          <label class="form-label">Agua Consumida Hoy (Litros)</label>
          <input type="number" class="form-control" id="consumo-agua" value="5480" min="10" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Temperatura Promedio Galpón (°C)</label>
          <input type="number" class="form-control" id="consumo-temp" value="22.5" step="0.1" required />
        </div>
        <div class="form-group">
          <label class="form-label">Humedad Relativa (%)</label>
          <input type="number" class="form-control" id="consumo-humedad" value="62.0" step="0.5" required />
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar Consumo</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('form-consumo')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const loteId = document.getElementById('consumo-lote').value;
    const alimento = parseFloat(document.getElementById('consumo-alimento').value);
    const agua = parseFloat(document.getElementById('consumo-agua').value);
    const temp = parseFloat(document.getElementById('consumo-temp').value);
    const hum = parseFloat(document.getElementById('consumo-humedad').value);

    store.registrarConsumoEngorde(loteId, {
      alimentoKg: alimento,
      aguaL: agua,
      tempC: temp,
      humedadPct: hum
    });

    const ratio = (agua / alimento).toFixed(2);
    modal.classList.remove('active');
    window.showToast(`Consumo registrado en ${loteId}: Ratio ${ratio} L/kg`, 'success');
    renderEngorde(document.getElementById('main-content-area'));
  });
}

function abrirModalFinalizarLote(loteId) {
  const state = store.getState();
  const lote = state.lotesEngorde.find(l => l.id === loteId);
  if (!lote) return;

  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = `Cierre y Despacho a Sacrificio: ${lote.codigo}`;

  if (lote.bloqueoFarmacologico && lote.diasRetiroPendientes > 0) {
    modalBody.innerHTML = `
      <div style="background: var(--siga-terracotta-soft); border: 1px solid var(--siga-terracotta-border); padding: 18px; border-radius: var(--radius-md); margin-bottom: 20px;">
        <h4 style="color: var(--siga-terracotta); font-size: 1.05rem; margin-bottom: 8px;">CANDADO SANITARIO ACTIVO</h4>
        <p style="color: var(--text-main); font-size: 0.88rem;">
          Este lote tiene prescrito <strong>${lote.medicamentoActivo || 'Tratamiento veterinario'}</strong> y le restan <strong>${lote.diasRetiroPendientes} días</strong> de periodo de retiro según normativa ICA.
        </p>
        <p style="color: var(--text-muted); font-size: 0.82rem; margin-top: 10px;">
          Por favor dirígete a <strong>Bioseguridad &amp; ICA</strong> para gestionar la farmacovigilancia antes de poder realizar la saca.
        </p>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <button type="button" class="btn btn-secondary modal-cancel">Entendido</button>
      </div>
    `;
    modal.classList.add('active');
    return;
  }

  modalBody.innerHTML = `
    <form id="form-finalizar-saca">
      <div style="background: var(--bg-surface); padding: 16px; border-radius: 8px; margin-bottom: 18px; border-left: 4px solid var(--siga-green-primary);">
        <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 4px;">Certificación de Saca Comercial</h4>
        <p style="color: var(--text-secondary); font-size: 0.82rem;">
          Al confirmar la saca, las <strong>${lote.avesVivas.toLocaleString()} aves</strong> serán despachadas a beneficio y el <strong>${lote.galponId}</strong> entrará inmediatamente en <strong>Vacío Sanitario obligatorio de 14 días</strong>.
        </p>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Kilos Totales en Báscula de Camión</label>
          <input type="number" class="form-control" id="saca-kilos" value="${Math.round((lote.avesVivas * lote.pesoPromedioG) / 1000)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Precio Liquidado por Kilo Vivo ($ COP)</label>
          <input type="number" class="form-control" id="saca-precio" value="6200" required />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Planta de Beneficio / Comprador</label>
        <input type="text" class="form-control" id="saca-comprador" value="Frigorífico Avícola del Valle &bull; Despacho Camión T-04" required />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-danger">Confirmar Despacho y Cerrar Lote</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('form-finalizar-saca')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const kilos = parseFloat(document.getElementById('saca-kilos').value);
    const precio = parseFloat(document.getElementById('saca-precio').value);
    const comprador = document.getElementById('saca-comprador').value;

    try {
      store.finalizarLoteSaca(lote.id, { kilos, precio, comprador });
      modal.classList.remove('active');
      window.showToast(`Lote ${lote.codigo} despachado. Galpón en Vacío Sanitario.`, 'success');
      renderEngorde(document.getElementById('main-content-area'));
    } catch (err) {
      window.showToast(err.message, 'error');
    }
  });
}
