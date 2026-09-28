import { store } from '../state.js';
import { icons } from '../icons.js';

let loteCostoSeleccionado = 'PE-2026-088';

export function renderCostos(container) {
  const state = store.getState();
  const costosMap = state.costosLotes || {};
  const lotesDisponibles = Object.keys(costosMap);

  if (lotesDisponibles.length > 0 && !costosMap[loteCostoSeleccionado]) {
    loteCostoSeleccionado = lotesDisponibles[0];
  }

  const c = costosMap[loteCostoSeleccionado] || {
    loteId: loteCostoSeleccionado,
    galponCodigo: 'Galpón 01',
    pollitoBB: 40700000,
    alimentoFases: 115200000,
    bioseguridadYVacunas: 4200000,
    materialCama: 1800000,
    energiaYGasPropano: 6800000,
    manoDeObraGalponero: 4500000,
    amortizacionVacioSanitario: 2100000,
    costosIndirectosGranja: 3800000,
    totalCostoAcumulado: 176300000,
    kilosVivosProducidos: 39484,
    costoPorKiloVivo: 4465.10,
    precioVentaKiloEsperado: 6200.00,
    margenBrutoEstimadoPct: 27.98
  };

  const utilidadTotal = Math.round((c.precioVentaKiloEsperado - c.costoPorKiloVivo) * c.kilosVivosProducidos);
  const puntoEquilibrioKg = c.precioVentaKiloEsperado > 0 ? Math.round(c.totalCostoAcumulado / c.precioVentaKiloEsperado) : 0;

  container.innerHTML = `
    <!-- ENCABEZADO -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">Costeo por Absorción y Rentabilidad Económica</h2>
        <p style="color: var(--text-muted); font-size: 0.82rem;">Distribución analítica de costos directos, indirectos fijos y amortización de descanso sanitario.</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 0.78rem; color: var(--text-muted); font-weight:600;">Lote a Evaluar:</label>
          <select class="form-control" id="select-lote-costo" style="width: auto; padding: 6px 12px; font-weight: 700;">
            ${lotesDisponibles.map(id => `
              <option value="${id}" ${id === loteCostoSeleccionado ? 'selected' : ''}>
                ${id} (${costosMap[id].galponCodigo || 'Galpón'})
              </option>
            `).join('')}
          </select>
        </div>
        <button class="btn btn-secondary" id="btn-modal-editar-costos">Modificar Rubros</button>
        <button class="btn btn-primary" id="btn-exportar-costos">${icons.download(14)} Exportar Liquidación CSV</button>
      </div>
    </div>

    <!-- TARJETAS DE RENTABILIDAD GENERAL -->
    <div class="kpi-grid">
      <div class="kpi-card" style="--card-accent: var(--siga-green-primary);">
        <div class="kpi-header">
          <span class="kpi-title">Costo por Kilo Vivo</span>
          <div class="kpi-icon-badge">${icons.dollar(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">$${Math.round(c.costoPorKiloVivo).toLocaleString()}</span>
          <span class="kpi-unit">COP / kg</span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-trend-positive">Punto Equilibrio: ${puntoEquilibrioKg.toLocaleString()} kg</span>
        </div>
      </div>

      <div class="kpi-card" style="--card-accent: var(--siga-gold-primary);">
        <div class="kpi-header">
          <span class="kpi-title">Precio Venta Esperado</span>
          <div class="kpi-icon-badge" style="color:var(--siga-gold-primary); background:var(--siga-gold-soft);">${icons.target(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">$${c.precioVentaKiloEsperado.toLocaleString()}</span>
          <span class="kpi-unit">COP / kg</span>
        </div>
        <div class="kpi-subtext">
          <span class="kpi-trend-positive">Cotización Mercado Mayorista</span>
        </div>
      </div>

      <div class="kpi-card" style="--card-accent: var(--siga-gold-light);">
        <div class="kpi-header">
          <span class="kpi-title">Margen Bruto Proyectado</span>
          <div class="kpi-icon-badge" style="color:var(--siga-gold-dark); background:var(--siga-gold-soft);">${icons.dollar(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">${c.margenBrutoEstimadoPct}%</span>
          <span class="kpi-unit">margen</span>
        </div>
        <div class="kpi-subtext">
          <span class="${utilidadTotal >= 0 ? 'kpi-trend-positive' : 'kpi-trend-danger'}">
            Utilidad: $${utilidadTotal.toLocaleString()} COP
          </span>
        </div>
      </div>

      <div class="kpi-card" style="--card-accent: var(--siga-terracotta);">
        <div class="kpi-header">
          <span class="kpi-title">Inversión Total Acumulada</span>
          <div class="kpi-icon-badge" style="color:var(--siga-terracotta); background:var(--siga-terracotta-soft);">${icons.fileText(18)}</div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">$${(c.totalCostoAcumulado / 1000000).toFixed(1)}M</span>
          <span class="kpi-unit">COP</span>
        </div>
        <div class="kpi-subtext">
          ${c.kilosVivosProducidos.toLocaleString()} kg carne viva
        </div>
      </div>
    </div>

    <!-- MATRIZ DE CENTROS DE COSTOS POR ABSORCIÓN -->
    <div class="card-panel" style="margin-bottom: 24px;">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Desglose Analítico de Costos &mdash; ${c.loteId} (${c.galponCodigo})</h3>
          <p class="panel-subtitle">Impacto porcentual por rubro productivo sobre el costo unitario</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="siga-table">
          <thead>
            <tr>
              <th>Centro de Costo / Rubro</th>
              <th>Método de Asignación</th>
              <th>Monto Total (COP)</th>
              <th>Costo por kg Vivo</th>
              <th>% Participación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Nutrición y Alimento por Fases</strong> (Preiniciador, Iniciador, Engorde)</td>
              <td>Directo Ponderado</td>
              <td>$${(c.alimentoFases || 0).toLocaleString()}</td>
              <td>$${c.kilosVivosProducidos > 0 ? ((c.alimentoFases || 0) / c.kilosVivosProducidos).toFixed(1) : '0'}</td>
              <td><strong style="color:var(--siga-gold-primary);">${c.totalCostoAcumulado > 0 ? (((c.alimentoFases || 0) / c.totalCostoAcumulado) * 100).toFixed(1) : 0}%</strong></td>
            </tr>
            <tr>
              <td><strong>Pollito BB de 1 día</strong> (Genética certificada)</td>
              <td>Directo</td>
              <td>$${(c.pollitoBB || 0).toLocaleString()}</td>
              <td>$${c.kilosVivosProducidos > 0 ? ((c.pollitoBB || 0) / c.kilosVivosProducidos).toFixed(1) : '0'}</td>
              <td>${c.totalCostoAcumulado > 0 ? (((c.pollitoBB || 0) / c.totalCostoAcumulado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Energía Eléctrica y Gas Propano</strong> (Criadoras térmicas + turbinas)</td>
              <td>Lectura / Consumo</td>
              <td>$${(c.energiaYGasPropano || 0).toLocaleString()}</td>
              <td>$${c.kilosVivosProducidos > 0 ? ((c.energiaYGasPropano || 0) / c.kilosVivosProducidos).toFixed(1) : '0'}</td>
              <td>${c.totalCostoAcumulado > 0 ? (((c.energiaYGasPropano || 0) / c.totalCostoAcumulado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Mano de Obra Directa</strong> (Galponeros y turnos de noche)</td>
              <td>Días-Hombre Asignados</td>
              <td>$${(c.manoDeObraGalponero || 0).toLocaleString()}</td>
              <td>$${c.kilosVivosProducidos > 0 ? ((c.manoDeObraGalponero || 0) / c.kilosVivosProducidos).toFixed(1) : '0'}</td>
              <td>${c.totalCostoAcumulado > 0 ? (((c.manoDeObraGalponero || 0) / c.totalCostoAcumulado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Bioseguridad, Vacunas y Fármacos</strong> (Biológicos Marek, Gumboro)</td>
              <td>Dosis Directa</td>
              <td>$${(c.bioseguridadYVacunas || 0).toLocaleString()}</td>
              <td>$${c.kilosVivosProducidos > 0 ? ((c.bioseguridadYVacunas || 0) / c.kilosVivosProducidos).toFixed(1) : '0'}</td>
              <td>${c.totalCostoAcumulado > 0 ? (((c.bioseguridadYVacunas || 0) / c.totalCostoAcumulado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Costos Indirectos Granja</strong> (Supervisión MVZ, predial, seguridad)</td>
              <td>Prorrateo por m²</td>
              <td>$${(c.costosIndirectosGranja || 0).toLocaleString()}</td>
              <td>$${c.kilosVivosProducidos > 0 ? ((c.costosIndirectosGranja || 0) / c.kilosVivosProducidos).toFixed(1) : '0'}</td>
              <td>${c.totalCostoAcumulado > 0 ? (((c.costosIndirectosGranja || 0) / c.totalCostoAcumulado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Amortización Vacío Sanitario Previo</strong> (Descanso y desinfección)</td>
              <td>Amortizado por Ciclo</td>
              <td>$${(c.amortizacionVacioSanitario || 0).toLocaleString()}</td>
              <td>$${c.kilosVivosProducidos > 0 ? ((c.amortizacionVacioSanitario || 0) / c.kilosVivosProducidos).toFixed(1) : '0'}</td>
              <td>${c.totalCostoAcumulado > 0 ? (((c.amortizacionVacioSanitario || 0) / c.totalCostoAcumulado) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr>
              <td><strong>Material de Cama</strong> (Cascarilla de arroz higienizada)</td>
              <td>Directo</td>
              <td>$${(c.materialCama || 0).toLocaleString()}</td>
              <td>$${c.kilosVivosProducidos > 0 ? ((c.materialCama || 0) / c.kilosVivosProducidos).toFixed(1) : '0'}</td>
              <td>${c.totalCostoAcumulado > 0 ? (((c.materialCama || 0) / c.totalCostoAcumulado) * 100).toFixed(1) : 0}%</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: var(--bg-surface); font-weight: 800; font-size: 0.92rem; color: var(--text-main);">
              <td>TOTAL COSTO POR ABSORCIÓN</td>
              <td>-</td>
              <td>$${c.totalCostoAcumulado.toLocaleString()}</td>
              <td style="color:var(--siga-green-primary); font-weight:800;">$${c.costoPorKiloVivo.toFixed(1)} / kg</td>
              <td>100.0%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- CALCULADORA DE SENSIBILIDAD FINANCIERA -->
    <div class="card-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Simulador de Sensibilidad &mdash; Variación de Precio de Mercado y Alimento</h3>
          <p class="panel-subtitle">Evalúa en vivo el impacto en el margen si sube el precio del grano o cambia el precio de venta</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
              <span style="color: var(--text-secondary); font-weight:600;">Precio de Venta Mercado ($/kg):</span>
              <strong id="sim-pv-val" style="color: var(--siga-gold-primary);">$${c.precioVentaKiloEsperado.toLocaleString()} COP</strong>
            </div>
            <input type="range" id="slider-pv" min="4000" max="8000" step="50" value="${c.precioVentaKiloEsperado}" style="width: 100%;" />
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
              <span style="color: var(--text-secondary); font-weight:600;">Variación Costo Alimento (%):</span>
              <strong id="sim-ca-val" style="color: #2563EB;">0%</strong>
            </div>
            <input type="range" id="slider-ca" min="-20" max="30" step="1" value="0" style="width: 100%;" />
          </div>
        </div>

        <div style="background: var(--bg-surface); padding: 20px; border-radius: var(--radius-md); border-left: 4px solid var(--siga-green-primary); border: 1px solid var(--border-subtle);">
          <h4 style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 8px;">Resultado de la Simulación</h4>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span style="color: var(--text-muted);">Nuevo Costo / kg:</span>
            <strong id="sim-res-costo" style="color: var(--text-main);">$${c.costoPorKiloVivo.toFixed(1)} COP</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem;">
            <span style="color: var(--text-muted);">Nuevo Margen Bruto:</span>
            <strong id="sim-res-margen" style="color: var(--siga-green-light); font-size: 1.15rem;">${c.margenBrutoEstimadoPct}%</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
            <span style="color: var(--text-muted);">Nueva Utilidad Total Lote:</span>
            <strong id="sim-res-utilidad" style="color: var(--siga-gold-primary); font-size: 1.15rem;">$${utilidadTotal.toLocaleString()} COP</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bindings
  document.getElementById('select-lote-costo')?.addEventListener('change', (e) => {
    loteCostoSeleccionado = e.target.value;
    renderCostos(container);
  });

  document.getElementById('btn-modal-editar-costos')?.addEventListener('click', () => {
    abrirModalEditarCostos(loteCostoSeleccionado);
  });

  document.getElementById('btn-exportar-costos')?.addEventListener('click', () => {
    exportarLiquidacionCSV(c);
  });

  // Slider de Sensibilidad
  const sliderPv = document.getElementById('slider-pv');
  const sliderCa = document.getElementById('slider-ca');
  const simPvVal = document.getElementById('sim-pv-val');
  const simCaVal = document.getElementById('sim-ca-val');
  const simResCosto = document.getElementById('sim-res-costo');
  const simResMargen = document.getElementById('sim-res-margen');
  const simResUtilidad = document.getElementById('sim-res-utilidad');

  function recalcularSensibilidad() {
    const pv = parseFloat(sliderPv.value);
    const varAlim = parseFloat(sliderCa.value) / 100;

    simPvVal.textContent = `$${pv.toLocaleString()} COP`;
    simCaVal.textContent = `${varAlim >= 0 ? '+' : ''}${(varAlim * 100).toFixed(0)}%`;

    const nuevoAlimento = (c.alimentoFases || 0) * (1 + varAlim);
    const otrosCostos = (c.totalCostoAcumulado - (c.alimentoFases || 0));
    const nuevoTotal = nuevoAlimento + otrosCostos;
    const nuevoCostoKg = c.kilosVivosProducidos > 0 ? nuevoTotal / c.kilosVivosProducidos : 0;
    const nuevoMargen = pv > 0 ? ((pv - nuevoCostoKg) / pv) * 100 : 0;
    const nuevaUtilidad = Math.round((pv - nuevoCostoKg) * c.kilosVivosProducidos);

    simResCosto.textContent = `$${nuevoCostoKg.toFixed(1)} COP`;
    simResMargen.textContent = `${nuevoMargen.toFixed(2)}%`;
    simResMargen.style.color = nuevoMargen >= 0 ? 'var(--siga-green-light)' : '#FB7185';
    simResUtilidad.textContent = `$${nuevaUtilidad.toLocaleString()} COP`;
    simResUtilidad.style.color = nuevaUtilidad >= 0 ? 'var(--siga-gold-primary)' : '#FB7185';
  }

  sliderPv?.addEventListener('input', recalcularSensibilidad);
  sliderCa?.addEventListener('input', recalcularSensibilidad);
}

function abrirModalEditarCostos(loteId) {
  const state = store.getState();
  const c = state.costosLotes[loteId];
  if (!c) return;

  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = `Ajustar Rubros de Costos: ${loteId}`;
  modalBody.innerHTML = `
    <form id="form-editar-costos">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Alimento por Fases (COP)</label>
          <input type="number" class="form-control" id="costo-alimento" value="${c.alimentoFases}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Pollito BB (COP)</label>
          <input type="number" class="form-control" id="costo-pollito" value="${c.pollitoBB}" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Energía Eléctrica y Gas Propano (COP)</label>
          <input type="number" class="form-control" id="costo-energia" value="${c.energiaYGasPropano}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mano de Obra Galponero (COP)</label>
          <input type="number" class="form-control" id="costo-mano-obra" value="${c.manoDeObraGalponero}" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Bioseguridad y Vacunas (COP)</label>
          <input type="number" class="form-control" id="costo-vacunas" value="${c.bioseguridadYVacunas}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Material de Cama (COP)</label>
          <input type="number" class="form-control" id="costo-cama" value="${c.materialCama}" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Costos Indirectos Granja (COP)</label>
          <input type="number" class="form-control" id="costo-indirectos" value="${c.costosIndirectosGranja}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Precio Venta Esperado ($/kg)</label>
          <input type="number" class="form-control" id="costo-precio-venta" value="${c.precioVentaKiloEsperado}" required />
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icons.check(14)} Guardar y Recalcular</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('form-editar-costos')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.actualizarCostosLote(loteId, {
      alimentoFases: parseFloat(document.getElementById('costo-alimento').value),
      pollitoBB: parseFloat(document.getElementById('costo-pollito').value),
      energiaYGasPropano: parseFloat(document.getElementById('costo-energia').value),
      manoDeObraGalponero: parseFloat(document.getElementById('costo-mano-obra').value),
      bioseguridadYVacunas: parseFloat(document.getElementById('costo-vacunas').value),
      materialCama: parseFloat(document.getElementById('costo-cama').value),
      costosIndirectosGranja: parseFloat(document.getElementById('costo-indirectos').value),
      precioVentaKiloEsperado: parseFloat(document.getElementById('costo-precio-venta').value)
    });

    modal.classList.remove('active');
    window.showToast(`Matriz de costos actualizada para ${loteId}`, 'success');
    renderCostos(document.getElementById('main-content-area'));
  });
}

function exportarLiquidacionCSV(c) {
  const lineas = [
    `SIGA Enterprise - Liquidación de Costos por Absorción`,
    `Lote;${c.loteId}`,
    `Galpón;${c.galponCodigo}`,
    `Fecha;${new Date().toISOString().split('T')[0]}`,
    ``,
    `Centro de Costo;Monto (COP);Costo/kg Vivo;Participación %`,
    `Alimento por Fases;${c.alimentoFases};${(c.alimentoFases / c.kilosVivosProducidos).toFixed(2)};${((c.alimentoFases / c.totalCostoAcumulado) * 100).toFixed(2)}%`,
    `Pollito BB;${c.pollitoBB};${(c.pollitoBB / c.kilosVivosProducidos).toFixed(2)};${((c.pollitoBB / c.totalCostoAcumulado) * 100).toFixed(2)}%`,
    `Energía y Gas Propano;${c.energiaYGasPropano};${(c.energiaYGasPropano / c.kilosVivosProducidos).toFixed(2)};${((c.energiaYGasPropano / c.totalCostoAcumulado) * 100).toFixed(2)}%`,
    `Mano de Obra;${c.manoDeObraGalponero};${(c.manoDeObraGalponero / c.kilosVivosProducidos).toFixed(2)};${((c.manoDeObraGalponero / c.totalCostoAcumulado) * 100).toFixed(2)}%`,
    `Bioseguridad y Vacunas;${c.bioseguridadYVacunas};${(c.bioseguridadYVacunas / c.kilosVivosProducidos).toFixed(2)};${((c.bioseguridadYVacunas / c.totalCostoAcumulado) * 100).toFixed(2)}%`,
    `Costos Indirectos Granja;${c.costosIndirectosGranja};${(c.costosIndirectosGranja / c.kilosVivosProducidos).toFixed(2)};${((c.costosIndirectosGranja / c.totalCostoAcumulado) * 100).toFixed(2)}%`,
    `Amortización Vacío Sanitario;${c.amortizacionVacioSanitario};${(c.amortizacionVacioSanitario / c.kilosVivosProducidos).toFixed(2)};${((c.amortizacionVacioSanitario / c.totalCostoAcumulado) * 100).toFixed(2)}%`,
    `Material de Cama;${c.materialCama};${(c.materialCama / c.kilosVivosProducidos).toFixed(2)};${((c.materialCama / c.totalCostoAcumulado) * 100).toFixed(2)}%`,
    ``,
    `TOTAL COSTO ACUMULADO;${c.totalCostoAcumulado};${c.costoPorKiloVivo.toFixed(2)};100%`,
    `Kilos Producidos;${c.kilosVivosProducidos}`,
    `Precio Venta Esperado ($/kg);${c.precioVentaKiloEsperado}`,
    `Margen Bruto;${c.margenBrutoEstimadoPct}%`
  ];

  const blob = new Blob([lineas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SIGA_Liquidacion_Costos_${c.loteId}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  window.showToast('Descargando archivo CSV de costos', 'info');
}
