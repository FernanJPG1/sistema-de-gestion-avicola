import { store } from './state.js';
import { icons } from './icons.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderEngorde } from './modules/engorde.js';
import { renderPonedoras } from './modules/ponedoras.js';
import { renderFieldMode } from './modules/field-mode.js';
import { renderBioseguridad } from './modules/bioseguridad.js';
import { renderCostos } from './modules/costos.js';

// Global Toast System
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? icons.check(16) : type === 'error' ? icons.alert(16) : type === 'warning' ? icons.alert(16) : icons.activity(16);
  toast.innerHTML = `<span style="display:inline-flex; align-items:center;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Application Router
const routes = {
  '#dashboard': { title: 'Command Center Ejecutivo', render: renderDashboard },
  '#engorde': { title: 'Gestión de Pollos de Engorde', render: renderEngorde },
  '#ponedoras': { title: 'Gallinas Ponedoras & Calidad de Huevo', render: renderPonedoras },
  '#field-mode': { title: 'Modo Campo Táctil (100% Offline)', render: renderFieldMode },
  '#bioseguridad': { title: 'Bioseguridad, ICA & Vacío Sanitario', render: renderBioseguridad },
  '#costos': { title: 'Costeo por Absorción & Rentabilidad', render: renderCostos }
};

function navigate() {
  const hash = window.location.hash || '#dashboard';
  const route = routes[hash] || routes['#dashboard'];

  // Actualizar Título Topbar
  const titleEl = document.getElementById('topbar-page-title');
  if (titleEl) titleEl.textContent = route.title;

  // Actualizar Nav Links
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Renderizar contenido
  const container = document.getElementById('main-content-area');
  if (container) {
    container.innerHTML = '';
    route.render(container);
  }

  // Scroll to top
  window.scrollTo(0, 0);
  actualizarUIEstado();
}

function actualizarUIEstado() {
  const state = store.getState();
  
  // Sync Badge
  const badgeEl = document.getElementById('sync-badge-text');
  const queueLen = state.colaSincronizacion.length;
  if (badgeEl) {
    if (queueLen > 0) {
      badgeEl.textContent = `${queueLen} en cola local`;
      badgeEl.parentElement.style.borderColor = 'var(--siga-gold-primary)';
      badgeEl.parentElement.style.color = '#F0CA86';
    } else {
      badgeEl.textContent = 'En Línea • Sincronizado';
      badgeEl.parentElement.style.borderColor = 'var(--siga-green-primary)';
      badgeEl.parentElement.style.color = '#79D19E';
    }
  }

  // Badges Sidebar
  const engordeBadge = document.querySelector('#nav-engorde .nav-badge');
  if (engordeBadge) {
    engordeBadge.textContent = `${state.lotesEngorde.length} lotes`;
  }

  const ponedorasBadge = document.querySelector('#nav-ponedoras .nav-badge');
  if (ponedorasBadge) {
    ponedorasBadge.textContent = `${state.lotesPonedoras.length} lotes`;
  }

  // Footer Granja
  const farmTitle = document.querySelector('.farm-info h4');
  const farmIca = document.querySelector('.farm-info p');
  if (farmTitle) farmTitle.textContent = state.currentFarm.name;
  if (farmIca) farmIca.textContent = state.currentFarm.registroIca;
}

// Modal de Configuración de Granja y Respaldo
function abrirModalGranja() {
  const state = store.getState();
  const farm = state.currentFarm;
  const modal = document.getElementById('global-modal');
  const modalBody = document.getElementById('global-modal-body');
  const modalTitle = document.getElementById('global-modal-title');

  modalTitle.textContent = 'Perfil de Granja & Gestión de Datos';
  modalBody.innerHTML = `
    <form id="form-perfil-granja">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nombre de la Granja</label>
          <input type="text" class="form-control" id="farm-name" value="${farm.name}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Registro ICA (GAB)</label>
          <input type="text" class="form-control" id="farm-ica" value="${farm.registroIca}" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Ubicación y Altitud</label>
          <input type="text" class="form-control" id="farm-ubicacion" value="${farm.ubicacion}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Capacidad Total Instalada (Aves)</label>
          <input type="number" class="form-control" id="farm-capacidad" value="${farm.capacidadTotalAves || 90000}" required />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Médico Veterinario Responsable Técnico</label>
        <input type="text" class="form-control" id="farm-vet" value="${farm.responsableTecnico || 'Dr. Roberto Méndez (MVZ Col. 11045)'}" required />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 24px;">
        <button type="submit" class="btn btn-primary">Guardar Datos de Granja</button>
      </div>
    </form>

    <div style="border-top: 1px solid var(--border-subtle); padding-top: 18px;">
      <h4 style="color: var(--siga-gold-primary); font-size: 0.95rem; margin-bottom: 8px;">Copia de Seguridad &amp; Restablecimiento</h4>
      <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 14px;">
        Descarga todos los lotes, registros biométricos y costos en un archivo JSON o restablece los datos demo.
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-secondary btn-sm" id="btn-descargar-json" style="display:inline-flex; align-items:center; gap:6px;">
          ${icons.download(16)} <span>Descargar Copia JSON</span>
        </button>
        <button class="btn btn-secondary btn-sm" id="btn-restaurar-json-trigger" style="display:inline-flex; align-items:center; gap:6px;">
          ${icons.upload(16)} <span>Restaurar desde JSON</span>
        </button>
        <input type="file" id="file-restaurar-json" accept=".json" style="display: none;" />
        <button class="btn btn-danger btn-sm" id="btn-reset-demo" style="display:inline-flex; align-items:center; gap:6px;">
          ${icons.refresh(16)} <span>Restablecer Datos Demo</span>
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  document.getElementById('form-perfil-granja')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.actualizarGranja({
      name: document.getElementById('farm-name').value,
      registroIca: document.getElementById('farm-ica').value,
      ubicacion: document.getElementById('farm-ubicacion').value,
      capacidadTotalAves: parseInt(document.getElementById('farm-capacidad').value, 10),
      responsableTecnico: document.getElementById('farm-vet').value
    });
    modal.classList.remove('active');
    window.showToast('Datos de granja actualizados', 'success');
    actualizarUIEstado();
    navigate();
  });

  document.getElementById('btn-descargar-json')?.addEventListener('click', () => {
    const dataStr = store.exportarBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIGA_Enterprise_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast('Copia de seguridad descargada', 'success');
  });

  const fileInput = document.getElementById('file-restaurar-json');
  document.getElementById('btn-restaurar-json-trigger')?.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const ok = store.importarBackup(event.target.result);
        if (ok) {
          modal.classList.remove('active');
          window.showToast('Copia de seguridad restaurada con éxito', 'success');
          actualizarUIEstado();
          navigate();
        } else {
          window.showToast('El archivo no contiene un formato JSON válido', 'error');
        }
      };
      reader.readAsText(file);
    }
  });

  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    if (confirm('¿Deseas restablecer todos los lotes y registros al estado demo inicial?')) {
      store.resetDemo();
      modal.classList.remove('active');
      window.showToast('Datos de demostración restablecidos con éxito', 'info');
      actualizarUIEstado();
      navigate();
    }
  });
}

function inicializarIconos() {
  const setIcon = (id, svgHtml) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = svgHtml;
  };

  setIcon('nav-icon-dash', icons.dashboard(18));
  setIcon('nav-icon-engorde', icons.bird(18));
  setIcon('nav-icon-ponedoras', icons.egg(18));
  setIcon('nav-icon-field', icons.field(18));
  setIcon('nav-icon-bioseg', icons.shield(18));
  setIcon('nav-icon-costos', icons.dollar(18));
  setIcon('farm-avatar-icon', icons.home(18));
  setIcon('quick-field-icon', icons.field(15));
  setIcon('user-pill-icon', icons.user(16));
}

function inicializarTema() {
  const temaGuardado = localStorage.getItem('siga_theme') || 'dark';
  aplicarTema(temaGuardado);

  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    const esClaro = document.documentElement.getAttribute('data-theme') === 'light';
    const nuevoTema = esClaro ? 'dark' : 'light';
    aplicarTema(nuevoTema);
    localStorage.setItem('siga_theme', nuevoTema);

    // Re-renderizar la vista actual para que los canvas actualicen sus colores
    const hash = window.location.hash || '#dashboard';
    const route = routes[hash] || routes['#dashboard'];
    const container = document.getElementById('main-content-area');
    if (container && route) {
      route.render(container);
    }
    window.showToast(`Modo ${nuevoTema === 'dark' ? 'Cyber-Obsidian Ejecutivo' : 'Studio Pro Claro'} activado`, 'info');
  });
}

function aplicarTema(tema) {
  const toggleIcon = document.getElementById('theme-toggle-icon');
  if (tema === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (toggleIcon) toggleIcon.innerHTML = icons.moon(16);
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (toggleIcon) toggleIcon.innerHTML = icons.sun(16);
  }
}

// Inicialización de Eventos y Modal Global
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar Iconos Vectoriales y Tema
  inicializarIconos();
  inicializarTema();

  window.addEventListener('hashchange', navigate);

  // Escuchar mutaciones del store para actualizar UI global en tiempo real
  store.subscribe(() => {
    actualizarUIEstado();
  });

  // Botón Sincronización Topbar
  document.getElementById('btn-sync-status')?.addEventListener('click', () => {
    const queueCount = store.getState().colaSincronizacion.length;
    if (queueCount === 0) {
      window.showToast('Todos los datos están sincronizados al día con el servidor central.', 'success');
    } else {
      store.sincronizarColaOffline();
      actualizarUIEstado();
      window.showToast(`Sincronizados ${queueCount} registros locales con el servidor central.`, 'success');
      navigate();
    }
  });

  // Botón Modo Campo en Topbar
  document.getElementById('btn-quick-field-mode')?.addEventListener('click', () => {
    window.location.hash = '#field-mode';
  });

  // Selector de Granja en Sidebar Footer
  document.querySelector('.farm-selector')?.addEventListener('click', () => {
    abrirModalGranja();
  });
  const farmSelectorEl = document.querySelector('.farm-selector');
  if (farmSelectorEl) {
    farmSelectorEl.style.cursor = 'pointer';
    farmSelectorEl.title = 'Clic para administrar perfil de granja y respaldos';
  }

  // Cierre de Modal Global
  const modal = document.getElementById('global-modal');
  document.getElementById('global-modal-close')?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-cancel')) {
      modal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });

  // Manejo de redimensionamiento de pantalla (responsividad de gráficos)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const hash = window.location.hash || '#dashboard';
      if (routes[hash]) {
        routes[hash].render(document.getElementById('main-content-area'));
      }
    }, 200);
  });

  // Lanzar primera navegación
  navigate();
});
