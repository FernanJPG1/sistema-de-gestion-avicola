/**
 * SIGA Enterprise - Canvas Chart Engine
 * Renderizador de gráficos zootécnicos de alta precisión matemática con adaptación automática a temas Claro y Oscuro.
 * Soporta pantallas Retina/High-DPI y redimensionamiento dinámico.
 */

export class ChartEngine {
  static isDarkMode() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  /**
   * Configura el canvas para alta resolución (Retina Display)
   */
  static setupCanvas(canvasId, defaultHeight = 280) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : 600;
    const height = defaultHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    return { canvas, ctx, width, height, isDark: this.isDarkMode() };
  }

  /**
   * 1. Dibuja la curva de crecimiento (Peso Real vs Estándar Genético con Banda de Tolerancia)
   */
  static renderCurvaCrecimiento(canvasId, dataReal, dataEstandar) {
    const setup = this.setupCanvas(canvasId, 280);
    if (!setup) return;
    const { ctx, width, height, isDark } = setup;
    const padding = { top: 32, right: 30, bottom: 40, left: 55 };

    ctx.clearRect(0, 0, width, height);

    const maxDia = 42;
    const maxPeso = 3600;

    const getX = (dia) => padding.left + (dia / maxDia) * (width - padding.left - padding.right);
    const getY = (peso) => height - padding.bottom - (peso / maxPeso) * (height - padding.top - padding.bottom);

    const gridColor = isDark ? '#1F2E24' : '#E2E8F0';
    const textColor = isDark ? '#8E9F96' : '#64748B';

    // Líneas de grilla horizontales
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let peso = 500; peso <= maxPeso; peso += 500) {
      const y = getY(peso);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${peso}g`, padding.left - 8, y + 3);
    }

    // Líneas de grilla verticales (semanas)
    for (let dia = 0; dia <= maxDia; dia += 7) {
      const x = getX(dia);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`D${dia}`, x, height - padding.bottom + 18);
    }

    ctx.setLineDash([]); // Reset dash

    // 1. Banda de Tolerancia Estándar (+/- 8%)
    if (dataEstandar && dataEstandar.length > 0) {
      ctx.fillStyle = isDark ? 'rgba(74, 114, 89, 0.16)' : 'rgba(74, 114, 89, 0.08)';
      ctx.beginPath();
      dataEstandar.forEach((pt, idx) => {
        const x = getX(pt.dia);
        const yUpper = getY(pt.pesoG * 1.08);
        if (idx === 0) ctx.moveTo(x, yUpper);
        else ctx.lineTo(x, yUpper);
      });
      for (let i = dataEstandar.length - 1; i >= 0; i--) {
        const pt = dataEstandar[i];
        const x = getX(pt.dia);
        const yLower = getY(pt.pesoG * 0.92);
        ctx.lineTo(x, yLower);
      }
      ctx.closePath();
      ctx.fill();

      // 2. Curva Estándar Genético (Línea Dorada discontinua)
      ctx.strokeStyle = '#D4A359';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      dataEstandar.forEach((pt, idx) => {
        const x = getX(pt.dia);
        const y = getY(pt.pesoG);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Curva Real del Lote (Línea Verde Esmeralda)
    if (dataReal && dataReal.length > 0) {
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = 'rgba(22, 163, 74, 0.3)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      dataReal.forEach((pt, idx) => {
        const x = getX(pt.dia);
        const y = getY(pt.pesoG);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset

      // Puntos de muestreo reales
      dataReal.forEach((pt) => {
        const x = getX(pt.dia);
        const y = getY(pt.pesoG);
        ctx.fillStyle = '#16A34A';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Label en el último punto
        if (pt === dataReal[dataReal.length - 1]) {
          ctx.fillStyle = isDark ? '#4ADE80' : '#15803D';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`${pt.pesoG}g`, x + 8, y - 6);
        }
      });
    }

    // Leyenda superior derecha
    const legX = width - padding.right - 210;
    const legY = padding.top - 12;
    ctx.font = '10px Inter, sans-serif';

    // Verde: Real
    ctx.fillStyle = '#16A34A';
    ctx.fillRect(legX, legY, 12, 3);
    ctx.fillText('Lote Real', legX + 16, legY + 4);

    // Dorado: Estándar
    ctx.fillStyle = '#D4A359';
    ctx.fillRect(legX + 80, legY, 12, 3);
    ctx.fillText('Meta Genética', legX + 96, legY + 4);
  }

  /**
   * 2. Dibuja el Ratio Hídrico Agua/Alimento (Indicador Alerta Temprana)
   */
  static renderRatioAguaAlimento(canvasId, historicoDias) {
    const setup = this.setupCanvas(canvasId, 240);
    if (!setup) return;
    const { ctx, width, height, isDark } = setup;
    const padding = { top: 25, right: 20, bottom: 35, left: 45 };

    ctx.clearRect(0, 0, width, height);

    const minRatio = 1.0;
    const maxRatio = 2.6;

    const getY = (val) => height - padding.bottom - ((val - minRatio) / (maxRatio - minRatio)) * (height - padding.top - padding.bottom);
    const getX = (idx, total) => padding.left + (idx / Math.max(1, total - 1)) * (width - padding.left - padding.right);

    // Franja Normal Óptima (1.6 - 1.85 L/kg) en Verde
    const yNormalSup = getY(1.85);
    const yNormalInf = getY(1.60);
    ctx.fillStyle = isDark ? 'rgba(74, 114, 89, 0.16)' : 'rgba(22, 163, 74, 0.10)';
    ctx.fillRect(padding.left, yNormalSup, width - padding.left - padding.right, yNormalInf - yNormalSup);

    // Línea de Alerta Estrés Calórico (>2.2)
    const yCalor = getY(2.20);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, yCalor);
    ctx.lineTo(width - padding.right, yCalor);
    ctx.stroke();
    ctx.fillStyle = '#DC2626';
    ctx.font = '9px Inter';
    ctx.textAlign = 'right';
    ctx.fillText('Estrés Térmico (2.20)', width - padding.right, yCalor - 4);

    // Línea de Alerta Deficiencia Hídrica (<1.4)
    const yBajo = getY(1.40);
    ctx.strokeStyle = '#D97706';
    ctx.beginPath();
    ctx.moveTo(padding.left, yBajo);
    ctx.lineTo(width - padding.right, yBajo);
    ctx.stroke();
    ctx.fillStyle = '#D97706';
    ctx.fillText('Alerta Bebederos (1.40)', width - padding.right, yBajo + 12);

    // Trazado de datos históricos reales
    ctx.setLineDash([]);
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    historicoDias.forEach((item, idx) => {
      const x = getX(idx, historicoDias.length);
      const y = getY(item.ratio);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    historicoDias.forEach((item, idx) => {
      const x = getX(idx, historicoDias.length);
      const y = getY(item.ratio);
      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Label eje X
      ctx.fillStyle = isDark ? '#8E9F96' : '#64748B';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = item.dia ? `D${item.dia}` : `P${idx + 1}`;
      ctx.fillText(label, x, height - padding.bottom + 15);
    });

    // Label eje Y
    ctx.fillStyle = isDark ? '#8E9F96' : '#64748B';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('2.5', padding.left - 6, getY(2.5) + 3);
    ctx.fillText('1.8', padding.left - 6, getY(1.8) + 3);
    ctx.fillText('1.2', padding.left - 6, getY(1.2) + 3);
  }

  /**
   * 3. Histograma de Pesajes con Distribución Gaussiana (Uniformidad y CV%)
   */
  static renderHistogramaPesaje(canvasId, muestreo) {
    const setup = this.setupCanvas(canvasId, 240);
    if (!setup || !muestreo) return;
    const { ctx, width, height, isDark } = setup;
    const padding = { top: 25, right: 25, bottom: 40, left: 45 };

    ctx.clearRect(0, 0, width, height);

    const media = muestreo.mediaG || 2180;
    const std = muestreo.desviacionG || 140;
    const buckets = [
      { label: `< ${media - 2 * std}g`, count: 4, desc: 'Muy liviano' },
      { label: `${media - std}g`, count: 18, desc: 'Liviano' },
      { label: `${media}g`, count: 58, highlight: true, desc: 'Óptimo Media' },
      { label: `${media + std}g`, count: 24, desc: 'Pesado' },
      { label: `> ${media + 2 * std}g`, count: 6, desc: 'Sobrepeso' }
    ];

    const maxCount = 65;
    const barWidth = (width - padding.left - padding.right) / buckets.length - 12;

    buckets.forEach((b, idx) => {
      const x = padding.left + idx * (barWidth + 12);
      const barHeight = (b.count / maxCount) * (height - padding.top - padding.bottom);
      const y = height - padding.bottom - barHeight;

      ctx.fillStyle = b.highlight ? '#D4A359' : '#4A7259';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
      ctx.fill();

      // Cantidad arriba
      ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${b.count} aves`, x + barWidth / 2, y - 6);

      // Label eje X
      ctx.fillStyle = b.highlight ? '#B45309' : (isDark ? '#8E9F96' : '#475569');
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(b.label, x + barWidth / 2, height - padding.bottom + 18);
    });
  }

  /**
   * 4. Curva de Saca Óptima Económica (Margen Neto vs Días de Vida)
   */
  static renderCurvaSacaOptima(canvasId, proyeccion, diaOptimo) {
    const setup = this.setupCanvas(canvasId, 220);
    if (!setup || !proyeccion || proyeccion.length === 0) return;
    const { ctx, width, height, isDark } = setup;
    const padding = { top: 25, right: 30, bottom: 35, left: 55 };

    ctx.clearRect(0, 0, width, height);

    const minMargen = Math.min(...proyeccion.map(p => p.margenNetoPorAve)) * 0.9;
    const maxMargen = Math.max(...proyeccion.map(p => p.margenNetoPorAve)) * 1.1;

    const getX = (idx) => padding.left + (idx / (proyeccion.length - 1)) * (width - padding.left - padding.right);
    const getY = (val) => height - padding.bottom - ((val - minMargen) / (maxMargen - minMargen)) * (height - padding.top - padding.bottom);

    // Grilla
    ctx.strokeStyle = isDark ? '#1F2E24' : '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const val = minMargen + (i / steps) * (maxMargen - minMargen);
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#8E9F96' : '#64748B';
      ctx.font = '9px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(`$${Math.round(val)}`, padding.left - 6, y + 3);
    }
    ctx.setLineDash([]);

    // Curva de margen neto
    ctx.strokeStyle = '#D4A359';
    ctx.lineWidth = 3;
    ctx.beginPath();
    proyeccion.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.margenNetoPorAve);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Puntos
    proyeccion.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.margenNetoPorAve);
      const esOpt = p.dia === diaOptimo;

      ctx.fillStyle = esOpt ? '#16A34A' : '#D4A359';
      ctx.beginPath();
      ctx.arc(x, y, esOpt ? 7 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (esOpt) {
        ctx.fillStyle = '#16A34A';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`★ ÓPTIMO D${p.dia}`, x, y - 10);
      }

      // Eje X
      if (idx % 2 === 0 || esOpt) {
        ctx.fillStyle = esOpt ? '#16A34A' : (isDark ? '#8E9F96' : '#64748B');
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`D${p.dia}`, x, height - padding.bottom + 16);
      }
    });
  }
}
