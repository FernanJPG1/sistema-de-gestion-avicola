import { store } from '../state.js';
import { icons } from '../icons.js';
import { abrirModalIngresarLote } from './dashboard.js';

let ponedoraSeleccionadaId = 'GP-2026-014';

export function renderPonedoras(container) {
  const state = store.getState();
  const lotes = state.lotesPonedoras || [];

  if (lotes.length > 0 && !lotes.some(l => l.id === ponedoraSeleccionadaId)) {
    ponedoraSeleccionadaId = lotes[0].id;
  }

  const loteActivo = lotes.find(l => l.id === ponedoraSeleccionadaId) || lotes[0] || null;

  container.innerHTML = `
    <!-- ENCABEZADO -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">Gestión de Gallinas Ponedoras y Calidad de Huevo</h2>
        <p style="color: var(--text-muted); font-size: 0.82rem;">Clasificación comercial estricta (NTC 1240 / USDA), persistencia semanal y Unidades Haugh.</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="btn-nuevo-lote-ponedora">${icons.plus(14)} Nuevo Lote</button>
        <button class="btn btn-gold" id="btn-modal-recoleccion-huevos">${icons.egg(14)} Registrar Recolección</button>
        <button class="btn btn-secondary" id="btn-modal-calidad-haugh">${icons.flask(14)} Calidad Haugh</button>
        <button class="btn btn-danger" id="btn-modal-bajas-ponedora">${icons.skull(14)} Bajas Postura</button>
      </div>
    </div>

    <!-- LOTES DE PONEDORAS ACTIVOS -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 30px;">
      ${lotes.length === 0 ? `
        <div class="card-panel" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 16px;">No hay lotes de ponedoras activos.</p>
          <button class="btn btn-primary" id="btn-crear-primer-lote-pon">${icons.plus(14)} Ingresar Primer Lote</button>
        </div>
      ` : lotes.map(l => {
        const cal = l.calidadClasificacion || { jumbo: 0, aaa: 0, aa: 0, a: 0, b: 0, c: 0, rotosFisurados: 0, sucios: 0 };
        const totalComerciales = (cal.jumbo || 0) + (cal.aaa || 0) + (cal.aa || 0) + (cal.a || 0) + (cal.b || 0) + (cal.c || 0);
        const totalNoConformes = (cal.rotosFisurados || 0) + (cal.sucios || 0);
        const pctComercial = l.huevosHoy > 0 ? Number(((totalComerciales / l.huevosHoy) * 100).toFixed(1)) : 100;
        const esSeleccionado = l.id === ponedoraSeleccionadaId;

        return `
          <div class="card-panel ${esSeleccionado ? 'card-panel-selected' : ''}" style="border-top: 4px solid var(--siga-gold-primary); position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
              <div>
                <span class="badge badge-warning" style="margin-bottom: 6px;">${l.galponId}</span>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); cursor: pointer;" class="btn-select-ponedora" data-lote="${l.id}">
                  ${l.codigo} ${esSeleccionado ? '★' : ''}
                </h3>
                <p style="color: var(--siga-gold-primary); font-weight: 700; font-size: 0.85rem;">${l.lineaGenetica}</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 1.8rem; font-weight: 900; color: var(--text-main);">${l.posturaPct}%</span>
                <p style="color: var(--text-muted); font-size: 0.75rem;">Semana ${l.edadSemanas} de vida</p>
              </div>
            </div>

            <!-- Métricas Clave -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
              <div>
                <span style="font-size: 0.72rem; color: var(--text-muted); display: block; font-weight:600;">HUEVOS HOY</span>
                <strong style="font-size: 1.15rem; color: var(--text-main);">${l.huevosHoy.toLocaleString()}</strong>
                <span style="font-size: 0.72rem; color: var(--siga-gold-primary); display: block; font-weight:700;">${pctComercial}% aptos</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: var(--text-muted); display: block; font-weight:600;">CONV. / DOCENA</span>
                <strong style="font-size: 1.15rem; color: var(--siga-green-light);">${l.conversionDocenaKg} kg</strong>
                <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">${l.consumoAlimentoAveDiaG}g/ave/día</span>
              </div>
              <div>
                <span style="font-size: 0.72rem; color: var(--text-muted); display: block; font-weight:600;">CALIDAD HAUGH</span>
                <strong style="font-size: 1.15rem; color: #38BDF8;">${l.unidadesHaugh} HU</strong>
                <span style="font-size: 0.72rem; color: var(--siga-green-light); display: block; font-weight:700;">Excelente (AA)</span>
              </div>
            </div>

            <!-- Clasificación Comercial NTC 1240 -->
            <h4 style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">
              Clasificación Comercial por Gramaje (NTC 1240)
            </h4>
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; text-align: center; margin-bottom: 14px;">
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 4px; border-radius: 6px;">
                <span style="font-size: 0.65rem; color: var(--text-muted); display: block; font-weight:700;">JUMBO</span>
                <strong style="color: var(--text-main); font-size: 0.85rem;">${cal.jumbo || 0}</strong>
              </div>
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 4px; border-radius: 6px;">
                <span style="font-size: 0.65rem; color: var(--text-muted); display: block; font-weight:700;">AAA</span>
                <strong style="color: var(--siga-gold-primary); font-size: 0.85rem;">${cal.aaa || 0}</strong>
              </div>
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 4px; border-radius: 6px;">
                <span style="font-size: 0.65rem; color: var(--text-muted); display: block; font-weight:700;">AA</span>
                <strong style="color: var(--text-main); font-size: 0.85rem;">${cal.aa || 0}</strong>
              </div>
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 4px; border-radius: 6px;">
                <span style="font-size: 0.65rem; color: var(--text-muted); display: block; font-weight:700;">A</span>
                <strong style="color: var(--text-main); font-size: 0.85rem;">${cal.a || 0}</strong>
              </div>
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 4px; border-radius: 6px;">
                <span style="font-size: 0.65rem; color: var(--text-muted); display: block; font-weight:700;">B</span>
                <strong style="color: var(--text-main); font-size: 0.85rem;">${cal.b || 0}</strong>
              </div>
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 8px 4px; border-radius: 6px;">
                <span style="font-size: 0.65rem; color: var(--text-muted); display: block; font-weight:700;">C</span>
                <strong style="color: var(--text-main); font-size: 0.85rem;">${cal.c || 0}</strong>
              </div>
            </div>

            <!-- Descarte y No Conformes -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--siga-terracotta-soft); border: 1px solid var(--siga-terracotta-border); border-radius: 6px; font-size: 0.78rem; margin-bottom: 14px;">
              <span style="color: var(--siga-terracotta); font-weight: 600;">No conformes: ${totalNoConformes} huevos (${cal.rotosFisurados || 0} rotos, ${cal.sucios || 0} sucios)</span>
              <span class="badge badge-success">Masa: ${l.masaHuevoG}g</span>
            </div>

            <!-- Botones de Acción -->
            <div style="display: flex; justify-content: flex-end; gap: 6px;">
              <button class="btn btn-secondary btn-sm btn-recolectar-rapido" data-lote="${l.id}">${icons.egg(13)} Recolectar</button>
              <button class="btn btn-secondary btn-sm btn-calidad-rapido" data-lote="${l.id}">${icons.flask(13)} Calidad</button>
              <button class="btn btn-danger btn-sm btn-bajas-ponedora-rapido" data-lote="${l.id}">${icons.skull(13)} Bajas</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- PERSISTENCIA DE POSTURA & GUÍA ZOOTÉCNICA -->
    ${loteActivo ? `
      <div class="card-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">Estándar de Postura y Persistencia Semanal (${loteActivo.codigo})</h3>
            <p class="panel-subtitle">Seguimiento de la persistencia productiva para determinar fecha óptima de reemplazo / muda inducida.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="badge badge-success">Semana ${loteActivo.edadSemanas}: ${loteActivo.posturaPct}% vs Meta ${loteActivo.posturaMetaPct}%</span>
            <select class="form-control" id="select-lote-postura" style="width: auto; padding: 4px 8px; font-size: 0.8rem;">
              ${lotes.map(l => `<option value="${l.id}" ${l.id === loteActivo.id ? 'selected' : ''}>${l.codigo} (${l.lineaGenetica})</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-weight: 700; color: var(--text-main);">Curva de Postura (${loteActivo.lineaGenetica})</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Pico alcanzado: 96.2% a la Semana 28</span>
            </div>
            <div style="display: flex; align-items: flex-end; gap: 8px; height: 160px; padding: 10px 0; border-bottom: 1px solid var(--border-subtle);">
              ${[
                { s: 20, p: 25 },
                { s: 22, p: 68 },
                { s: 24, p: 91 },
                { s: 26, p: 95 },
                { s: 28, p: 96 },
                { s: 30, p: 95.5 },
                { s: 32, p: loteActivo.posturaPct, active: true },
                { s: 36, p: 93, proj: true },
                { s: 40, p: 91, proj: true },
                { s: 50, p: 88, proj: true },
                { s: 60, p: 83, proj: true },
                { s: 70, p: 77, proj: true }
              ].map(item => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
                  <span style="font-size: 0.65rem; color: ${item.active ? '#B45309' : '#64748B'}; margin-bottom: 4px; font-weight: ${item.active ? '800' : 'normal'};">
                    ${item.p}%
                  </span>
                  <div style="width: 100%; height: ${(item.p / 100) * 110}px; background: ${item.active ? 'var(--siga-gold-primary)' : (item.proj ? '#CBD5E1' : 'var(--siga-green-primary)')}; border-radius: 4px 4px 0 0; ${item.active ? 'box-shadow: 0 0 10px rgba(212,163,89,0.5);' : ''}"></div>
                  <span style="font-size: 0.65rem; color: var(--text-muted); margin-top: 6px;">S${item.s}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; justify-content: center; gap: 14px;">
            <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight:600;">HUEVOS POR AVE ALOJADA (HAA)</span>
              <strong style="font-size: 1.4rem; color: var(--text-main);">${loteActivo.huevosAveAlojada} huevos</strong>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Meta a 52 semanas: &gt; 320 huevos/ave</p>
            </div>
            <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--border-subtle);">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight:600;">PROYECCIÓN DE DESCARTE / PELECHA</span>
              <strong style="font-size: 1.15rem; color: var(--siga-gold-primary);">Semana 82 (Enero 2027)</strong>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Punto de corte donde el ingreso supera el costo de reemplazo.</p>
            </div>
          </div>
        </div>
      </div>
    ` : ''}
  `;

  // Bindings
  document.getElementById('btn-nuevo-lote-ponedora')?.addEventListener('click', () => {
    abrirModalIngresarLote();
  });
  document.getElementById('btn-crear-primer-lote-pon')?.addEventListener('click', () => {
    abrirModalIngresarLote();
  });

  document.getElementById('btn-modal-recoleccion-huevos')?.addEventListener('click', () => {
    abrirModalHuevos(loteActivo ? loteActivo.id : null);
  });
  document.getElementById('btn-modal-calidad-haugh')?.addEventListener('click', () => {
    abrirModalHaugh(loteActivo ? loteActivo.id : null);
  });
  document.getElementById('btn-modal-bajas-ponedora')?.addEventListener('click', () => {
    abrirModalBajasPonedora(loteActivo ? loteActivo.id : null);
  });

  document.querySelectorAll('.btn-recolectar-rapido').forEach(btn => {
    btn.addEventListener('click', () => abrirModalHuevos(btn.dataset.lote));
  });
  document.querySelectorAll('.btn-calidad-rapido').forEach(btn => {
    btn.addEventListener('click', () => abrirModalHaugh(btn.dataset.lote));
  });
  document.querySelectorAll('.btn-bajas-ponedora-rapido').forEach(btn => {
    btn.addEventListener('click', () => abrirModalBajasPonedora(btn.dataset.lote));
  });

  document.querySelectorAll('.btn-select-ponedora').forEach(el => {
    el.addEventListener('click', () => {
      ponedoraSeleccionadaId = el.dataset.lote;
      renderPonedoras(container);
    });
  });

  document.getElementById('select-lote-postura')?.addEventListener('change', (e) => {
    ponedoraSeleccionadaId = e.target.value;
    renderPonedoras(container);
  });
}

function abrirModalHuevos(lotePreseleccionado = null) {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Registrar Recolección Diaria de Huevos (Norma NTC 1240)';
  const lotesOptions = state.lotesPonedoras.map(l => `
    <option value="${l.id}" ${l.id === lotePreseleccionado ? 'selected' : ''}>
      ${l.codigo} (${l.galponId} &bull; ${l.lineaGenetica})
    </option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-recoleccion-huevos">
      <div class="form-group">
        <label class="form-label">Lote de Ponedoras</label>
        <select class="form-control" id="huevos-lote">
          ${lotesOptions}
        </select>
      </div>

      <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--siga-gold-primary); text-transform: uppercase; margin: 16px 0 10px;">
        Clasificación por Tamaños Comerciales (Unidades)
      </h4>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">Jumbo (&gt;78g)</label>
          <input type="number" class="form-control h-calc" id="h-jumbo" value="1420" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">AAA (67-77g)</label>
          <input type="number" class="form-control h-calc" id="h-aaa" value="4850" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">AA (60-66g)</label>
          <input type="number" class="form-control h-calc" id="h-aa" value="3210" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">A (53-59g)</label>
          <input type="number" class="form-control h-calc" id="h-a" value="1420" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">B (46-52g)</label>
          <input type="number" class="form-control h-calc" id="h-b" value="210" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">C (&lt;46g)</label>
          <input type="number" class="form-control h-calc" id="h-c" value="45" min="0" />
        </div>
      </div>

      <h4 style="font-size: 0.82rem; font-weight: 700; color: var(--siga-terracotta); text-transform: uppercase; margin: 16px 0 10px;">
        Huevos No Conformes (Descarte)
      </h4>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Rotos / Fisurados / Fárfaras</label>
          <input type="number" class="form-control h-calc" id="h-rotos" value="85" min="0" />
        </div>
        <div class="form-group">
          <label class="form-label">Sucios de heces</label>
          <input type="number" class="form-control h-calc" id="h-sucios" value="40" min="0" />
        </div>
      </div>

      <div style="background: var(--bg-surface); padding: 12px 16px; border-radius: 8px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-subtle);">
        <span style="color: var(--text-muted); font-size: 0.85rem;">Total Huevos a Registrar:</span>
        <strong id="h-total-preview" style="color: var(--text-main); font-size: 1.2rem;">11,280 huevos</strong>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-gold">${icons.check(14)} Guardar Recolección</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  const calcularTotal = () => {
    const jumbo = parseInt(document.getElementById('h-jumbo').value) || 0;
    const aaa = parseInt(document.getElementById('h-aaa').value) || 0;
    const aa = parseInt(document.getElementById('h-aa').value) || 0;
    const a = parseInt(document.getElementById('h-a').value) || 0;
    const b = parseInt(document.getElementById('h-b').value) || 0;
    const c = parseInt(document.getElementById('h-c').value) || 0;
    const rotos = parseInt(document.getElementById('h-rotos').value) || 0;
    const sucios = parseInt(document.getElementById('h-sucios').value) || 0;
    const total = jumbo + aaa + aa + a + b + c + rotos + sucios;
    document.getElementById('h-total-preview').textContent = `${total.toLocaleString()} huevos`;
  };

  document.querySelectorAll('.h-calc').forEach(inp => {
    inp.addEventListener('input', calcularTotal);
  });

  document.getElementById('form-recoleccion-huevos')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const loteId = document.getElementById('huevos-lote').value;
    const desglose = {
      jumbo: parseInt(document.getElementById('h-jumbo').value) || 0,
      aaa: parseInt(document.getElementById('h-aaa').value) || 0,
      aa: parseInt(document.getElementById('h-aa').value) || 0,
      a: parseInt(document.getElementById('h-a').value) || 0,
      b: parseInt(document.getElementById('h-b').value) || 0,
      c: parseInt(document.getElementById('h-c').value) || 0,
      rotos: parseInt(document.getElementById('h-rotos').value) || 0,
      sucios: parseInt(document.getElementById('h-sucios').value) || 0
    };

    store.registrarProduccionHuevos(loteId, desglose);
    modal.classList.remove('active');
    window.showToast(`Recolección guardada para ${loteId}`, 'success');
    renderPonedoras(document.getElementById('main-content-area'));
  });
}

function abrirModalHaugh(lotePreseleccionado = null) {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Laboratorio de Calidad Interna del Huevo (Unidades Haugh)';
  const lotesOptions = state.lotesPonedoras.map(l => `
    <option value="${l.id}" ${l.id === lotePreseleccionado ? 'selected' : ''}>
      ${l.codigo} (${l.lineaGenetica})
    </option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-calidad-haugh">
      <div class="form-group">
        <label class="form-label">Lote Evaluado</label>
        <select class="form-control" id="haugh-lote">
          ${lotesOptions}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Peso Promedio del Huevo (g)</label>
          <input type="number" class="form-control haugh-calc" id="haugh-peso" value="62.5" step="0.1" required />
        </div>
        <div class="form-group">
          <label class="form-label">Altura del Albumen Denso (mm)</label>
          <input type="number" class="form-control haugh-calc" id="haugh-altura" value="7.2" step="0.1" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Color de Yema (Escala Roche DSM 1-15)</label>
          <input type="number" class="form-control" id="haugh-color" value="12" min="1" max="15" required />
        </div>
        <div class="form-group">
          <label class="form-label">Grosor de Cáscara (mm)</label>
          <input type="number" class="form-control" id="haugh-cascara" value="0.38" step="0.01" required />
        </div>
      </div>

      <div style="background: var(--siga-blue-soft); border: 1px solid var(--siga-blue-border); padding: 14px; border-radius: 8px; margin-top: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.85rem; color: #1E40AF; font-weight:600;">Unidades Haugh Calculadas (HU):</span>
          <strong id="haugh-result-preview" style="color: #1E40AF; font-size: 1.25rem;">88.2 HU (Excelente AA)</strong>
        </div>
        <p style="font-size: 0.72rem; color: #3B82F6; margin-top: 4px;">Fórmula: 100 * log10(H - 1.7 * W^0.37 + 7.6)</p>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icons.check(14)} Guardar Análisis</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  const calcularHU = () => {
    const w = parseFloat(document.getElementById('haugh-peso').value) || 60;
    const h = parseFloat(document.getElementById('haugh-altura').value) || 7;
    const hu = 100 * Math.log10(Math.max(1, h - 1.7 * Math.pow(w, 0.37) + 7.6));
    const finalHU = Number(hu.toFixed(1));
    const calif = finalHU >= 72 ? 'Excelente (AA)' : finalHU >= 60 ? 'Buena (A)' : 'Regular (B)';
    document.getElementById('haugh-result-preview').textContent = `${finalHU} HU (${calif})`;
    return finalHU;
  };

  document.querySelectorAll('.haugh-calc').forEach(inp => {
    inp.addEventListener('input', calcularHU);
  });

  document.getElementById('form-calidad-haugh')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const loteId = document.getElementById('haugh-lote').value;
    const hu = calcularHU();
    const peso = parseFloat(document.getElementById('haugh-peso').value);

    const lote = state.lotesPonedoras.find(l => l.id === loteId);
    if (lote) {
      lote.unidadesHaugh = hu;
      lote.masaHuevoG = peso;
      store.saveState();
    }

    modal.classList.remove('active');
    window.showToast(`Calidad Haugh registrada para ${loteId}: ${hu} HU`, 'success');
    renderPonedoras(document.getElementById('main-content-area'));
  });
}

function abrirModalBajasPonedora(lotePreseleccionado = null) {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Registrar Bajas en Lote de Postura';
  const lotesOptions = state.lotesPonedoras.map(l => `
    <option value="${l.id}" ${l.id === lotePreseleccionado ? 'selected' : ''}>
      ${l.codigo} (${l.galponId})
    </option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-bajas-ponedora">
      <div class="form-group">
        <label class="form-label">Lote de Postura</label>
        <select class="form-control" id="bajas-pon-lote">
          ${lotesOptions}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cantidad de Gallinas Bajas</label>
          <input type="number" class="form-control" id="bajas-pon-cant" value="2" min="1" max="200" required />
        </div>
        <div class="form-group">
          <label class="form-label">Causa Principal</label>
          <select class="form-control" id="bajas-pon-causa">
            <option value="Prolapso">Prolapso Oviductal / Picaje</option>
            <option value="Peritonitis">Peritonitis por Yema</option>
            <option value="Fatiga_Jaula">Fatiga de Ponedora / Descalcificación</option>
            <option value="Respiratorio">Síndrome de Baja de Postura (EDS)</option>
            <option value="Otras">Descarte natural / Senescencia</option>
          </select>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-danger">Confirmar Bajas</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('form-bajas-ponedora')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const loteId = document.getElementById('bajas-pon-lote').value;
    const cant = parseInt(document.getElementById('bajas-pon-cant').value, 10);
    const causa = document.getElementById('bajas-pon-causa').value;

    store.registrarBajas(loteId, cant, causa);
    modal.classList.remove('active');
    window.showToast(`Bajas registradas en ${loteId}: ${cant} gallinas (${causa})`, 'warning');
    renderPonedoras(document.getElementById('main-content-area'));
  });
}
