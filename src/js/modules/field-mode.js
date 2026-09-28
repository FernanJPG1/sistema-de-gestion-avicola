import { store } from '../state.js';
import { icons } from '../icons.js';

let selectedGalpon = 'G-01';
let selectedCategory = 'mortalidad';
let currentValue = '0';

export function renderFieldMode(container) {
  const state = store.getState();
  const queueLength = state.colaSincronizacion.length;
  const currentGalponObj = state.galpones.find(g => g.id === selectedGalpon) || state.galpones[0];

  // Determinar si el galpón actual es de postura
  const esGalponPostura = currentGalponObj && state.lotesPonedoras.some(p => p.id === currentGalponObj.loteId || p.galponId === currentGalponObj.id);

  container.innerHTML = `
    <div class="field-mode-container">
      <!-- BANNER DE ESTADO LOCAL-FIRST -->
      <div class="field-banner">
        <div class="field-banner-info">
          <h2 style="display:flex; align-items:center; gap:8px;">${icons.field(22)} Modo Campo Táctil (100% Offline)</h2>
          <p>Diseñado para captura rápida en galpón con guantes, sin dependencia de cobertura celular ni wifi.</p>
        </div>
        <div class="field-storage-badge" id="field-sync-pill" style="cursor: pointer;" title="Clic para sincronizar con la nube">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${queueLength > 0 ? '#F59E0B' : '#4ADE80'};"></span>
          <span>${queueLength > 0 ? `${queueLength} registros offline en cola` : 'Almacenamiento Local Sincronizado'}</span>
        </div>
      </div>

      <!-- SELECTOR RÁPIDO DE GALPÓN -->
      <div class="field-card">
        <label class="form-label" style="margin-bottom: 12px; color: var(--siga-gold-primary); font-size: 0.85rem; font-weight: 600;">
          1. Selecciona el Galpón de Trabajo:
        </label>
        <div class="quick-galpon-grid">
          ${state.galpones.map(g => `
            <div class="quick-galpon-btn ${g.id === selectedGalpon ? 'active' : ''}" data-galpon="${g.id}">
              <div class="galpon-name">${g.codigo}</div>
              <div class="galpon-batch">${g.loteId || (g.estado === 'vacio_sanitario' ? 'Vacío Sanitario' : 'Disponible')}</div>
            </div>
          `).join('')}
        </div>

        <!-- SELECTOR DE TIPO DE REGISTRO -->
        <label class="form-label" style="margin-bottom: 12px; color: var(--siga-gold-primary); font-size: 0.85rem; font-weight: 600;">
          2. Selecciona la Métrica a Registrar:
        </label>
        <div class="input-category-selector" id="categories-container">
          <div class="category-tab ${selectedCategory === 'mortalidad' ? 'active' : ''}" data-cat="mortalidad">
            ${icons.skull(18)} Mortalidad / Bajas
          </div>
          <div class="category-tab ${selectedCategory === 'alimento' ? 'active' : ''}" data-cat="alimento">
            ${icons.wheat(18)} Alimento (kg)
          </div>
          <div class="category-tab ${selectedCategory === 'agua' ? 'active' : ''}" data-cat="agua">
            ${icons.droplet(18)} Agua (Litros)
          </div>
          <div class="category-tab ${selectedCategory === 'temperatura' ? 'active' : ''}" data-cat="temperatura">
            ${icons.thermometer(18)} Temperatura (°C)
          </div>
          <div class="category-tab ${selectedCategory === 'huevos' ? 'active' : ''}" data-cat="huevos" style="${esGalponPostura ? 'border-color:var(--siga-gold-primary);' : ''}">
            ${icons.egg(18)} Huevos Recolectados
          </div>
        </div>

        <!-- NUMPAD TÁCTIL GIGANTE Y DISPLAY -->
        <div class="numpad-container">
          <!-- Pantalla del Valor Actual -->
          <div class="numpad-display-box">
            <span class="numpad-field-label" id="numpad-label">MORTALIDAD (AVES MUERTAS)</span>
            <div class="numpad-value-preview" id="numpad-display">${currentValue}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 0.82rem; color: var(--text-muted);" id="field-context-info">
                ${currentGalponObj.codigo} &bull; ${currentGalponObj.loteId || 'Sin Lote Asignado'}
              </span>
              <button class="btn btn-secondary btn-sm" id="btn-voice-input" style="display:inline-flex; align-items:center; gap:6px;">
                ${icons.mic(16)} Entrada de Voz
              </button>
            </div>
          </div>

          <!-- Teclado Numérico Gigante -->
          <div class="numpad-grid">
            <button class="numpad-key" data-num="1">1</button>
            <button class="numpad-key" data-num="2">2</button>
            <button class="numpad-key" data-num="3">3</button>
            
            <button class="numpad-key" data-num="4">4</button>
            <button class="numpad-key" data-num="5">5</button>
            <button class="numpad-key" data-num="6">6</button>
            
            <button class="numpad-key" data-num="7">7</button>
            <button class="numpad-key" data-num="8">8</button>
            <button class="numpad-key" data-num="9">9</button>
            
            <button class="numpad-key key-action" id="key-clear" title="Borrar todo">C</button>
            <button class="numpad-key" data-num="0">0</button>
            <button class="numpad-key key-action" id="key-back" title="Borrar último dígito">&larr;</button>
            
            <button class="numpad-key key-confirm" id="key-submit">
              GUARDAR REGISTRO LOCAL
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bindings Galpón
  container.querySelectorAll('.quick-galpon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedGalpon = btn.dataset.galpon;
      container.querySelectorAll('.quick-galpon-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      actualizarInfoContexto();
    });
  });

  // Bindings Categoría
  container.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      selectedCategory = tab.dataset.cat;
      container.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentValue = '0';
      actualizarDisplay();
      actualizarInfoContexto();
    });
  });

  // Bindings Numpad
  container.querySelectorAll('.numpad-key[data-num]').forEach(key => {
    key.addEventListener('click', () => {
      const num = key.dataset.num;
      if (currentValue === '0') {
        currentValue = num;
      } else if (currentValue.length < 7) {
        currentValue += num;
      }
      actualizarDisplay();
    });
  });

  document.getElementById('key-clear')?.addEventListener('click', () => {
    currentValue = '0';
    actualizarDisplay();
  });

  document.getElementById('key-back')?.addEventListener('click', () => {
    if (currentValue.length > 1) {
      currentValue = currentValue.slice(0, -1);
    } else {
      currentValue = '0';
    }
    actualizarDisplay();
  });

  document.getElementById('key-submit')?.addEventListener('click', () => {
    guardarRegistroCampo();
  });

  document.getElementById('btn-voice-input')?.addEventListener('click', () => {
    iniciarEntradaVoz();
  });

  document.getElementById('field-sync-pill')?.addEventListener('click', () => {
    const pendientes = store.sincronizarColaOffline();
    window.showToast(`✓ Sincronizados ${pendientes} registros locales con el servidor central`, 'success');
    renderFieldMode(container);
  });

  function actualizarDisplay() {
    const el = document.getElementById('numpad-display');
    if (el) el.textContent = currentValue;
  }

  function actualizarInfoContexto() {
    const labelEl = document.getElementById('numpad-label');
    const infoEl = document.getElementById('field-context-info');

    const labels = {
      mortalidad: 'MORTALIDAD (AVES MUERTAS)',
      alimento: 'ALIMENTO ENTREGADO (KILOGRAMOS)',
      agua: 'CONSUMO DE AGUA (LITROS)',
      temperatura: 'TEMPERATURA AMBIENTE (°C)',
      huevos: 'HUEVOS RECOLECTADOS HOY (UNIDADES)'
    };

    if (labelEl) labelEl.textContent = labels[selectedCategory] || 'VALOR';
    if (infoEl) {
      const g = state.galpones.find(x => x.id === selectedGalpon);
      infoEl.textContent = `${g ? g.codigo : selectedGalpon} • ${g && g.loteId ? g.loteId : 'Sin Lote Asignado'}`;
    }
  }

  function guardarRegistroCampo() {
    const val = parseInt(currentValue, 10);
    if (val <= 0) {
      window.showToast('Ingresa un valor numérico mayor a cero', 'warning');
      return;
    }

    const galpon = state.galpones.find(g => g.id === selectedGalpon);
    if (!galpon || !galpon.loteId) {
      window.showToast(`El ${galpon ? galpon.codigo : selectedGalpon} no tiene un lote activo asignado`, 'warning');
      return;
    }

    const loteId = galpon.loteId;
    const esLoteEngorde = state.lotesEngorde.some(l => l.id === loteId);
    const esLotePonedora = state.lotesPonedoras.some(p => p.id === loteId);

    if (selectedCategory === 'mortalidad') {
      store.registrarBajas(loteId, val, 'Registro Rápido Modo Campo (Guante)');
    } else if (selectedCategory === 'alimento') {
      if (esLoteEngorde) {
        store.registrarConsumoEngorde(loteId, { alimentoKg: val });
      } else if (esLotePonedora) {
        const pon = state.lotesPonedoras.find(p => p.id === loteId);
        if (pon) {
          pon.consumoAlimentoHoyKg = val;
          store.saveState();
        }
      }
    } else if (selectedCategory === 'agua') {
      if (esLoteEngorde) {
        store.registrarConsumoEngorde(loteId, { aguaL: val });
      } else if (esLotePonedora) {
        const pon = state.lotesPonedoras.find(p => p.id === loteId);
        if (pon) {
          pon.consumoAguaHoyL = val;
          store.saveState();
        }
      }
    } else if (selectedCategory === 'temperatura') {
      if (esLoteEngorde) {
        store.registrarConsumoEngorde(loteId, { tempC: val });
      }
    } else if (selectedCategory === 'huevos') {
      if (esLotePonedora) {
        // Distribuir proporcionalmente en categorías comerciales
        const jumbo = Math.round(val * 0.12);
        const aaa = Math.round(val * 0.42);
        const aa = Math.round(val * 0.28);
        const a = Math.round(val * 0.13);
        const b = Math.round(val * 0.03);
        const c = Math.round(val * 0.01);
        const rotos = Math.round(val * 0.008);
        const sucios = Math.round(val * 0.002);
        store.registrarProduccionHuevos(loteId, { jumbo, aaa, aa, a, b, c, rotos, sucios });
      } else {
        window.showToast('El lote seleccionado es de engorde, no de postura de huevos', 'warning');
        return;
      }
    }

    // Vibración háptica en dispositivos móviles
    if ('vibrate' in navigator) {
      navigator.vibrate([40, 20, 40]);
    }

    window.showToast(`✓ Guardado offline: ${val.toLocaleString()} (${selectedCategory}) en ${galpon.codigo}`, 'success');
    currentValue = '0';
    actualizarDisplay();
    renderFieldMode(container); // Refrescar contador de pendientes
  }

  function iniciarEntradaVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-CO';
        recognition.continuous = false;
        recognition.interimResults = false;

        window.showToast('🎙️ Escuchando... Di por ejemplo: "Mortalidad 6 bajas"', 'info');

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          parsearComandoVoz(transcript);
        };

        recognition.onerror = () => {
          simularEntradaVozModal();
        };

        recognition.start();
        return;
      } catch (e) {
        // Fallback al simulador interactivo
      }
    }

    simularEntradaVozModal();
  }

  function parsearComandoVoz(texto) {
    const numeros = texto.match(/\d+/);
    if (numeros) {
      currentValue = numeros[0];
    }

    if (texto.includes('mortalidad') || texto.includes('bajas') || texto.includes('muertas')) {
      selectedCategory = 'mortalidad';
    } else if (texto.includes('alimento') || texto.includes('comida') || texto.includes('kilos')) {
      selectedCategory = 'alimento';
    } else if (texto.includes('agua') || texto.includes('litros')) {
      selectedCategory = 'agua';
    } else if (texto.includes('temperatura') || texto.includes('grados')) {
      selectedCategory = 'temperatura';
    } else if (texto.includes('huevo') || texto.includes('postura')) {
      selectedCategory = 'huevos';
    }

    // Detectar galpón
    if (texto.includes('galpón 1') || texto.includes('galpon 1')) selectedGalpon = 'G-01';
    if (texto.includes('galpón 2') || texto.includes('galpon 2')) selectedGalpon = 'G-02';
    if (texto.includes('galpón 3') || texto.includes('galpon 3')) selectedGalpon = 'G-03';
    if (texto.includes('galpón 4') || texto.includes('galpon 4')) selectedGalpon = 'G-04';
    if (texto.includes('galpón 5') || texto.includes('galpon 5')) selectedGalpon = 'G-05';

    actualizarDisplay();
    actualizarInfoContexto();
    renderFieldMode(container);
    window.showToast(`Voz reconocida: "${texto}" &rarr; ${currentValue}`, 'success');
  }

  function simularEntradaVozModal() {
    const modal = document.getElementById('global-modal');
    const modalBody = document.getElementById('global-modal-body');
    const modalTitle = document.getElementById('global-modal-title');

    modalTitle.textContent = 'Entrada por Comando de Voz Asistido';
    modalBody.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 14px;">
        Selecciona un comando de voz de campo habitual o dicta un valor:
      </p>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
        <button class="btn btn-secondary btn-voz-preset" data-cmd="Mortalidad 6 bajas en Galpón 01" style="display:flex; align-items:center; gap:8px;">
          ${icons.mic(15)} <span>"Mortalidad 6 bajas en Galpón 01"</span>
        </button>
        <button class="btn btn-secondary btn-voz-preset" data-cmd="Alimento 3200 kilos Galpón 01" style="display:flex; align-items:center; gap:8px;">
          ${icons.mic(15)} <span>"Alimento 3,200 kilos Galpón 01"</span>
        </button>
        <button class="btn btn-secondary btn-voz-preset" data-cmd="Agua 5500 litros Galpón 01" style="display:flex; align-items:center; gap:8px;">
          ${icons.mic(15)} <span>"Agua 5,500 litros Galpón 01"</span>
        </button>
        <button class="btn btn-secondary btn-voz-preset" data-cmd="Huevos 11450 unidades Galpón 04" style="display:flex; align-items:center; gap:8px;">
          ${icons.mic(15)} <span>"Huevos 11,450 unidades Galpón 04"</span>
        </button>
        <button class="btn btn-secondary btn-voz-preset" data-cmd="Temperatura 24 grados Galpón 03" style="display:flex; align-items:center; gap:8px;">
          ${icons.mic(15)} <span>"Temperatura 24 grados Galpón 03"</span>
        </button>
      </div>

      <div class="form-group">
        <label class="form-label">O escribe la frase dictada por el operador:</label>
        <input type="text" class="form-control" id="custom-voice-text" placeholder="Ej: Mortalidad 4 en Galpón 03" />
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-secondary modal-cancel">Cancelar</button>
        <button type="button" class="btn btn-primary" id="btn-procesar-voz-custom">Procesar Comando</button>
      </div>
    `;

    modal.classList.add('active');

    modalBody.querySelectorAll('.btn-voz-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        parsearComandoVoz(btn.dataset.cmd);
        modal.classList.remove('active');
      });
    });

    document.getElementById('btn-procesar-voz-custom')?.addEventListener('click', () => {
      const val = document.getElementById('custom-voice-text').value.trim();
      if (val) {
        parsearComandoVoz(val);
      }
      modal.classList.remove('active');
    });
  }
}
