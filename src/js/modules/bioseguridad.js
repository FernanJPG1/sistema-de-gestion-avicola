import { store } from '../state.js';
import { icons } from '../icons.js';

let vacioSeleccionadoId = null;

export function renderBioseguridad(container) {
  const state = store.getState();
  const vacios = state.vaciosSanitarios || [];
  const tratamientos = state.tratamientosSanitarios || [];

  if (vacios.length > 0 && !vacios.some(v => v.id === vacioSeleccionadoId)) {
    vacioSeleccionadoId = vacios[0].id;
  }

  const vacioActivo = vacios.find(v => v.id === vacioSeleccionadoId) || vacios[0] || null;

  container.innerHTML = `
    <!-- ENCABEZADO -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">Bioseguridad y Cumplimiento Normativo (ICA)</h2>
        <p style="color: var(--text-muted); font-size: 0.82rem;">Resoluciones ICA 3651 / 3652 (GAB), protocolo de Vacío Sanitario y Farmacovigilancia.</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-iniciar-vacio">${icons.plus(14)} Iniciar Vacío Sanitario</button>
        <button class="btn btn-primary" id="btn-modal-tratamiento">${icons.shield(14)} Registrar Tratamiento Veterinario</button>
      </div>
    </div>

    <!-- TARJETA GRANJA AVÍCOLA BIOSEGURA (ICA) -->
    <div class="card-panel" style="margin-bottom: 24px; border-left: 4px solid var(--siga-green-primary);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <span class="badge badge-success">Certificación Vigente GAB</span>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 6px;">${state.currentFarm.name}</h3>
          <p style="color: var(--text-secondary); font-size: 0.86rem;">
            ${state.currentFarm.certificacion} &bull; Registro Oficial: <strong style="color:var(--siga-gold-primary);">${state.currentFarm.registroIca}</strong>
          </p>
          <p style="color: var(--text-muted); font-size: 0.76rem; margin-top: 2px;">
            Responsable Sanitario: ${state.currentFarm.responsableTecnico} &bull; Ubicación: ${state.currentFarm.ubicacion}
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <div style="background: var(--bg-surface); padding: 10px 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block; font-weight:700;">RODILUVIOS / ARCOS</span>
            <strong style="color: var(--siga-green-light); font-size: 0.88rem;">100% Operativos</strong>
          </div>
          <div style="background: var(--bg-surface); padding: 10px 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block; font-weight:700;">MALLAS ANTIPÁJARO</span>
            <strong style="color: var(--siga-green-light); font-size: 0.88rem;">Inspección OK</strong>
          </div>
          <div style="background: var(--bg-surface); padding: 10px 16px; border-radius: 8px; text-align: center; border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.68rem; color: var(--text-muted); display: block; font-weight:700;">POTABILIDAD AGUA</span>
            <strong style="color: #38BDF8; font-size: 0.88rem;">Cloro 2.5 ppm</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- PROTOCOLO DE VACÍO SANITARIO Y DESINFECCIÓN -->
    <div class="card-panel" style="margin-bottom: 24px;">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Protocolo de Vacío Sanitario Obligatorio (14 Días ICA)</h3>
          <p class="panel-subtitle">Plan maestro de higienización terminal, muestreo microbiológico y descanso biológico.</p>
        </div>
        ${vacios.length > 1 ? `
          <select class="form-control" id="select-vacio-activo" style="width: auto; padding: 4px 10px; font-size: 0.85rem;">
            ${vacios.map(v => `<option value="${v.id}" ${v.id === vacioActivo.id ? 'selected' : ''}>${v.galponCodigo} (${v.id})</option>`).join('')}
          </select>
        ` : ''}
      </div>

      ${!vacioActivo ? `
        <div style="padding: 30px; text-align: center; color: var(--text-muted);">
          No hay galpones actualmente en descanso de vacío sanitario.
        </div>
      ` : `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="font-size: 1.15rem; color: var(--text-main); font-weight: 800;">${vacioActivo.galponCodigo}</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted);">
              Fecha inicio: <strong>${vacioActivo.fechaInicio}</strong> &bull; Requerido ICA: <strong>${vacioActivo.diasRequeridosIca} días continuos</strong>
            </p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 1.6rem; font-weight: 900; color: var(--siga-gold-primary);">
              Día ${vacioActivo.diasTranscurridos} de ${vacioActivo.diasRequeridosIca}
            </span>
            <span style="display: block; font-size: 0.75rem; color: ${vacioActivo.diasTranscurridos >= vacioActivo.diasRequeridosIca ? 'var(--siga-green-light)' : 'var(--siga-gold-light)'}; font-weight:600;">
              ${vacioActivo.diasTranscurridos >= vacioActivo.diasRequeridosIca ? '✓ Tiempo de descanso cumplido' : `Restan ${vacioActivo.diasRequeridosIca - vacioActivo.diasTranscurridos} días de descanso`}
            </span>
          </div>
        </div>

        <!-- Barra de Progreso del Vacío Sanitario -->
        <div style="width: 100%; height: 8px; background: var(--bg-surface); border-radius: 999px; overflow: hidden; margin-bottom: 20px; border: 1px solid var(--border-subtle);">
          <div style="width: ${Math.min(100, (vacioActivo.diasTranscurridos / vacioActivo.diasRequeridosIca) * 100)}%; height: 100%; background: linear-gradient(90deg, var(--siga-green-primary), var(--siga-gold-primary)); border-radius: 999px;"></div>
        </div>

        <!-- Checklist Interactivo de Pasos Sanitarios -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          ${vacioActivo.etapas.map((paso, idx) => {
            const estaCompletado = paso.estado === 'completado' || paso.estado === 'negativo_aprobado';
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-surface); border-radius: 8px; border: 1px solid ${estaCompletado ? 'var(--siga-green-border)' : 'var(--border-subtle)'}; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <span style="font-weight: 800; color: var(--siga-gold-primary); font-family: var(--font-mono); font-size: 0.95rem;">0${idx + 1}</span>
                  <div>
                    <strong style="color: var(--text-main); font-size: 0.9rem;">${paso.paso}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                      ${paso.fecha ? `<span>Ejecutado: ${paso.fecha}</span>` : '<span>Estado: Pendiente de ejecución</span>'}
                      ${paso.notas ? ` &bull; <em>${paso.notas}</em>` : ''}
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  ${paso.estado === 'completado' ? `
                    <span class="badge badge-success">${icons.check(12)} Completado</span>
                    <button class="btn btn-secondary btn-sm btn-toggle-etapa" data-vacio="${vacioActivo.id}" data-idx="${idx}" data-nuevo="en_espera">Desmarcar</button>
                  ` : paso.estado === 'negativo_aprobado' ? `
                    <span class="badge badge-success">${icons.check(12)} Negativo (Salmonella Aprobado)</span>
                    <button class="btn btn-secondary btn-sm btn-toggle-etapa" data-vacio="${vacioActivo.id}" data-idx="${idx}" data-nuevo="en_espera">Desmarcar</button>
                  ` : `
                    <span class="badge badge-warning">En Espera</span>
                    <button class="btn btn-primary btn-sm btn-toggle-etapa" data-vacio="${vacioActivo.id}" data-idx="${idx}" data-nuevo="${idx === 4 ? 'negativo_aprobado' : 'completado'}">
                      ${icons.check(12)} Completar Paso
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Botón de Aprobación Final para Nueva Carga -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: var(--siga-green-soft); border-radius: var(--radius-md); border: 1px solid var(--siga-green-border); flex-wrap: wrap; gap: 10px;">
          <div>
            <strong style="color: var(--siga-green-dark); font-size: 0.95rem;">Certificación de Aptitud de Carga</strong>
            <p style="color: var(--text-secondary); font-size: 0.8rem;">
              ${vacioActivo.aprobadoParaCarga 
                ? `Aprobado por ${vacioActivo.aprobadoPorVeterinario || 'Veterinario'}. El galpón está habilitado para ingresar un nuevo lote.` 
                : 'Requiere completar todas las etapas de higienización y mínimo 14 días de descanso sanitario.'}
            </p>
          </div>
          <div>
            ${vacioActivo.aprobadoParaCarga ? `
              <span class="badge badge-success" style="font-size: 0.85rem; padding: 6px 14px;">${icons.check(14)} GALPÓN APTO PARA CARGA</span>
            ` : `
              <button class="btn btn-primary" id="btn-aprobar-galpon" data-vacio="${vacioActivo.id}">
                ${icons.fileText(14)} Firmar y Certificar Galpón
              </button>
            `}
          </div>
        </div>
      `}
    </div>

    <!-- FARMACOVIGILANCIA Y CANDADOS SANITARIOS -->
    <div class="card-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Farmacovigilancia y Candado Sanitario de Despacho (ICA)</h3>
          <p class="panel-subtitle">Sistema automatizado de bloqueo de sacrificio para garantizar CERO residuos de antibióticos en carne de pollo o huevo.</p>
        </div>
        <span class="badge badge-danger">Tolerancia Cero a Residuos</span>
      </div>

      <div class="table-wrapper">
        <table class="siga-table">
          <thead>
            <tr>
              <th>Lote Afectado</th>
              <th>Medicamento / Principio Activo</th>
              <th>Dosis y Vía</th>
              <th>Periodo Retiro (ICA)</th>
              <th>Fecha Liberación</th>
              <th>Veterinario Prescriptor</th>
              <th>Estado Candado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${tratamientos.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">
                  No hay tratamientos registrados en el sistema.
                </td>
              </tr>
            ` : tratamientos.map(t => `
              <tr>
                <td><code>${t.loteId}</code> (${t.galponCodigo})</td>
                <td>
                  <strong>${t.medicamento}</strong>
                  <span style="display:block; font-size:0.75rem; color:var(--text-muted);">${t.principioActivo}</span>
                </td>
                <td>${t.dosis} &bull; ${t.via}</td>
                <td>
                  <strong>${t.diasRetiro} días</strong>
                  ${t.estado === 'bloqueado' ? `<span style="display:block; font-size:0.75rem; color:#DC2626;">(Restan ${t.diasRestantes} días)</span>` : ''}
                </td>
                <td><strong style="color:var(--siga-gold-primary);">${t.fechaLiberacion}</strong></td>
                <td><span style="font-size:0.8rem;">${t.veterinario}</span></td>
                <td>
                  ${t.estado === 'bloqueado' ? `
                    <span class="badge badge-danger">${icons.lock(11)} BLOQUEADO PARA FAENA</span>
                  ` : `
                    <span class="badge badge-success">${icons.check(11)} LIBERADO (Apto)</span>
                  `}
                </td>
                <td>
                  ${t.estado === 'bloqueado' ? `
                    <button class="btn btn-secondary btn-sm btn-liberar-tratamiento" data-id="${t.id}" title="Liberar candado tras certificación veterinaria">
                      ${icons.unlock(12)} Liberar
                    </button>
                  ` : `
                    <span style="color: var(--text-muted); font-size: 0.8rem;">Cumplido</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bindings
  document.getElementById('select-vacio-activo')?.addEventListener('change', (e) => {
    vacioSeleccionadoId = e.target.value;
    renderBioseguridad(container);
  });

  document.querySelectorAll('.btn-toggle-etapa').forEach(btn => {
    btn.addEventListener('click', () => {
      const vacioId = btn.dataset.vacio;
      const idx = parseInt(btn.dataset.idx, 10);
      const nuevo = btn.dataset.nuevo;
      store.actualizarEtapaVacioSanitario(vacioId, idx, nuevo);
      window.showToast('Etapa de vacío sanitario actualizada', 'success');
      renderBioseguridad(container);
    });
  });

  document.getElementById('btn-aprobar-galpon')?.addEventListener('click', (e) => {
    const vacioId = e.target.dataset.vacio;
    abrirModalAprobacionGalpon(vacioId);
  });

  document.getElementById('btn-iniciar-vacio')?.addEventListener('click', () => {
    abrirModalIniciarVacio();
  });

  document.getElementById('btn-modal-tratamiento')?.addEventListener('click', () => {
    abrirModalTratamiento();
  });

  document.querySelectorAll('.btn-liberar-tratamiento').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (confirm('¿Confirmas que el periodo de retiro farmacológico ha concluido y el lote está libre de residuos?')) {
        store.liberarTratamiento(id);
        window.showToast('Candado sanitario liberado con éxito', 'success');
        renderBioseguridad(container);
      }
    });
  });
}

function abrirModalAprobacionGalpon(vacioId) {
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Certificación Veterinaria de Vacío Sanitario (Aptitud de Carga)';
  modalBody.innerHTML = `
    <form id="form-aprobar-galpon">
      <div style="background: var(--siga-green-soft); padding: 16px; border-radius: 8px; margin-bottom: 18px; border-left: 4px solid var(--siga-green-primary);">
        <h4 style="color: var(--siga-green-dark); font-size: 0.95rem; margin-bottom: 4px;">Declaración de Conformidad ICA Res. 3651/3652</h4>
        <p style="color: var(--text-secondary); font-size: 0.82rem;">
          Como Médico Veterinario responsable, certifico que este galpón cumplió con el retiro de pollinaza, lavado espumógeno, flameado térmico, desinfección química, negatividad microbiológica a Salmonella y el descanso sanitario requerido.
        </p>
      </div>

      <div class="form-group">
        <label class="form-label">Médico Veterinario Inspector</label>
        <input type="text" class="form-control" id="vet-nombre" value="Dr. Roberto Méndez (MP: 11045-COMVEZCOL)" required />
      </div>

      <div class="form-group">
        <label class="form-label">Número de Dictamen de Laboratorio Salmonella</label>
        <input type="text" class="form-control" id="vet-laboratorio" value="LAB-BIO-2026-9482 (Labovet Colombia)" required />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icons.check(14)} Certificar y Habilitar Galpón</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('form-aprobar-galpon')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const vet = document.getElementById('vet-nombre').value;
    store.aprobarGalponParaCarga(vacioId, vet);
    modal.classList.remove('active');
    window.showToast('Galpón certificado y disponible para nueva carga', 'success');
    renderBioseguridad(document.getElementById('main-content-area'));
  });
}

function abrirModalIniciarVacio() {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Iniciar Nuevo Protocolo de Vacío Sanitario';
  const galponesOptions = state.galpones.map(g => `
    <option value="${g.id}">
      ${g.codigo} &bull; Estado actual: ${g.estado.toUpperCase()}
    </option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-nuevo-vacio">
      <div class="form-group">
        <label class="form-label">Seleccionar Galpón a Higienizar</label>
        <select class="form-control" id="nuevo-vacio-galpon" required>
          ${galponesOptions}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Días Requeridos de Descanso (Mínimo 14 ICA)</label>
          <input type="number" class="form-control" id="nuevo-vacio-dias" value="14" min="14" max="30" required />
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Inicio</label>
          <input type="date" class="form-control" id="nuevo-vacio-fecha" value="${new Date().toISOString().split('T')[0]}" required />
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icons.check(14)} Iniciar Protocolo Sanitario</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('form-nuevo-vacio')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const galponId = document.getElementById('nuevo-vacio-galpon').value;
    const dias = parseInt(document.getElementById('nuevo-vacio-dias').value, 10);
    const res = store.iniciarVacioSanitario(galponId, dias);
    modal.classList.remove('active');
    window.showToast(`Vacío sanitario iniciado en ${res ? res.galponCodigo : galponId}`, 'success');
    renderBioseguridad(document.getElementById('main-content-area'));
  });
}

function abrirModalTratamiento() {
  const state = store.getState();
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Registrar Tratamiento Veterinario y Activar Candado de Retiro';
  const lotesOptions = state.lotesEngorde.map(l => `
    <option value="${l.id}">${l.codigo} (${l.galponId})</option>
  `).join('');

  modalBody.innerHTML = `
    <form id="form-tratamiento">
      <div class="form-group">
        <label class="form-label">Lote Destino</label>
        <select class="form-control" id="trat-lote">
          ${lotesOptions}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Medicamento Comercial</label>
          <input type="text" class="form-control" id="trat-med" value="Amoxicilina Trihidrato al 50%" required />
        </div>
        <div class="form-group">
          <label class="form-label">Principio Activo</label>
          <input type="text" class="form-control" id="trat-principio" value="Amoxicilina (Betalactámico)" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Dosis y Frecuencia</label>
          <input type="text" class="form-control" id="trat-dosis" value="20 mg/kg p.v. cada 24 horas" required />
        </div>
        <div class="form-group">
          <label class="form-label">Vía de Administración</label>
          <select class="form-control" id="trat-via">
            <option value="Agua de bebida">Agua de bebida (Dosificador volumétrico)</option>
            <option value="Alimento mezcal">Alimento en mezcla (Tolva)</option>
            <option value="Inyección parenteral">Inyección subcutánea / intramuscular</option>
            <option value="Aspersión">Aspersión / Nebulización</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Días de Periodo de Retiro (ICA)</label>
          <input type="number" class="form-control" id="trat-dias" value="7" min="1" max="30" required />
        </div>
        <div class="form-group">
          <label class="form-label">Médico Veterinario Prescriptor</label>
          <input type="text" class="form-control" id="trat-vet" value="Dra. Carolina Martínez (MP: 14892-COMVEZCOL)" required />
        </div>
      </div>

      <div style="background: var(--siga-terracotta-soft); padding: 12px 16px; border-radius: 8px; margin-top: 14px; border: 1px solid var(--siga-terracotta-border);">
        <strong style="color: var(--siga-terracotta); font-size: 0.85rem;">AVISO DE CANDADO SANITARIO:</strong>
        <p style="color: var(--text-main); font-size: 0.78rem; margin-top: 2px;">
          Al guardar este tratamiento, el sistema activará automáticamente el bloqueo de faena/sacrificio para evitar cualquier despacho hasta que el periodo de retiro finalice.
        </p>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary">${icons.lock(14)} Registrar Tratamiento &amp; Bloquear</button>
      </div>
    </form>
  `;

  modal.classList.add('active');

  document.getElementById('form-tratamiento')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const loteId = document.getElementById('trat-lote').value;
    const med = document.getElementById('trat-med').value;
    const principio = document.getElementById('trat-principio').value;
    const dosis = document.getElementById('trat-dosis').value;
    const via = document.getElementById('trat-via').value;
    const dias = parseInt(document.getElementById('trat-dias').value, 10);
    const vet = document.getElementById('trat-vet').value;

    const fechaHoy = new Date();
    const fechaLiberacion = new Date(fechaHoy.getTime() + dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const lote = state.lotesEngorde.find(l => l.id === loteId);

    store.registrarTratamiento({
      loteId,
      galponCodigo: lote ? lote.galponId : 'Galpón',
      medicamento: med,
      principioActivo: principio,
      dosis,
      via,
      diasRetiro: dias,
      fechaLiberacion,
      veterinario: vet
    });

    modal.classList.remove('active');
    window.showToast(`Tratamiento ${med} registrado. Candado sanitario activo (${dias} días).`, 'warning');
    renderBioseguridad(document.getElementById('main-content-area'));
  });
}
