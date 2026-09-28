/**
 * SIGA Enterprise - Vector Icon System
 * Iconos vectoriales limpios (estilo Lucide / Heroicons, trazo 2px redondeado)
 * Cero dependencias externas.
 */

function svg(paths, size = 18, className = 'siga-icon') {
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export const icons = {
  dashboard: (size = 18) => svg('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>', size),
  bird: (size = 18) => svg('<path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 18Z"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>', size),
  egg: (size = 18) => svg('<path d="M12 22c4.97 0 9-4.03 9-9 0-4.97-4.03-11-9-11s-9 6.03-9 11c0 4.97 4.03 9 9 9z"/>', size),
  field: (size = 18) => svg('<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>', size),
  shield: (size = 18) => svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>', size),
  dollar: (size = 18) => svg('<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', size),
  scale: (size = 18) => svg('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>', size),
  droplet: (size = 18) => svg('<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>', size),
  activity: (size = 18) => svg('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', size),
  alert: (size = 18) => svg('<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>', size),
  check: (size = 18) => svg('<polyline points="20 6 9 17 4 12"/>', size),
  plus: (size = 18) => svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', size),
  sun: (size = 18) => svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>', size),
  moon: (size = 18) => svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>', size),
  refresh: (size = 18) => svg('<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/>', size),
  download: (size = 18) => svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>', size),
  upload: (size = 18) => svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>', size),
  lock: (size = 18) => svg('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', size),
  unlock: (size = 18) => svg('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>', size),
  thermometer: (size = 18) => svg('<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>', size),
  wheat: (size = 18) => svg('<path d="m2 22 10-10"/><path d="M16 8a4 4 0 0 0-4-4 4 4 0 0 0-4 4c0 2 2 4 4 4s4-2 4-4Z"/><path d="M18 14a4 4 0 0 0-4-4 4 4 0 0 0-4 4c0 2 2 4 4 4s4-2 4-4Z"/>', size),
  target: (size = 18) => svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', size),
  fileText: (size = 18) => svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>', size),
  flask: (size = 18) => svg('<path d="M10 2v7.31a2 2 0 0 1-.59 1.41L4.7 15.41A4 4 0 0 0 7.53 22h8.94a4 4 0 0 0 2.83-6.59l-4.71-4.69A2 2 0 0 1 14 9.31V2"/><line x1="8.5" x2="15.5" y1="2" y2="2"/><line x1="7" x2="17" y1="16" y2="16"/>', size),
  mic: (size = 18) => svg('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>', size),
  skull: (size = 18) => svg('<path d="M12 2a8 8 0 0 0-8 8c0 3.1 1.8 5.8 4.4 7.1L8 20h8l-.4-2.9c2.6-1.3 4.4-4 4.4-7.1a8 8 0 0 0-8-8Z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 17v3"/><path d="M14 17v3"/>', size),
  home: (size = 18) => svg('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', size),
  user: (size = 18) => svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', size),
  arrowRight: (size = 18) => svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', size)
};
