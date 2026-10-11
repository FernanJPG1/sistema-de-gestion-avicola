# 🐔 SIGA Enterprise &mdash; Sistema Integrado de Gestión Avícola
> **Arquitectura Multi-Plataforma Offline-First y Sistema de Diseño Agronómico Profesional**
> *Generado automáticamente el 11/10/2026 08:04:23*

---

## 📌 1. Resumen de Arquitectura (Homologada con Proyecto Siembras)

SIGA Enterprise adopta la arquitectura robusta, modular y desacoplada del **Proyecto Siembras**, estructurada en 3 pilares principales:

```
PROYECTO_AVICOLA/
│
├── .agents/                        # Reglas del asistente y flujos de trabajo
│   └── rules/
│       └── auto_git_push.md        # Regla de auto-commit y sincronización remota
│
├── backend/                        # Servidor central FastAPI (Python)
│   ├── app/
│   │   ├── api/                    # Endpoints REST (granjas, lotes, registros, sync)
│   │   ├── core/                   # Configuración y variables de entorno
│   │   ├── db/                     # Conexión SQLite WAL, esquemas y backups rotativos
│   │   ├── models/                 # Modelos Pydantic tipados
│   │   └── main.py                 # Punto de entrada de la API con Swagger docs
│   ├── logs/                       # Bitácora de peticiones y auditoría
│   ├── backups/                    # Copias de seguridad automáticas en cada sync
│   ├── requirements.txt            # Dependencias Python
│   └── run.py                      # Ejecutor del servidor Uvicorn
│
├── app_movil/                      # Aplicación móvil Flutter (Dart) para Android / iOS
│   ├── lib/
│   │   ├── database/               # Base de datos SQLite local (local_db.dart) con WAL
│   │   ├── screens/                # Pantallas: Dashboard, Menú Módulos, Formulario, Rendimiento
│   │   ├── services/               # Respaldo continuo (persistent_backup_service.dart)
│   │   ├── utils/                  # CalendarioUtil (regla 48h), Responsive
│   │   ├── widgets/                # Marca de agua permanente (FirmaWatermark)
│   │   └── main.dart               # Ciclo de vida con checkpoint automático
│   └── pubspec.yaml                # Dependencias móviles
│
├── src/                            # Aplicación Web / PWA de Alto Rendimiento (Vite)
│   ├── css/
│   │   ├── variables.css           # Tokens de diseño idénticos a Siembras (#7CB342, #33691E)
│   │   ├── main.css                # Sistema visual, tablas, podio y badges
│   │   └── field-mode.css          # Interfaz táctil de alto contraste
│   └── js/
│       ├── modules/                # Dashboard, Engorde, Ponedoras, Modo Campo, Bioseguridad, Costos
│       ├── chart-engine.js         # Motor vectorial de gráficas zootécnicas
│       ├── state.js                # Almacén reactivo Local-First con sync HTTP
│       └── app.js                  # Enrutador y botón flotante (+)
│
├── iniciar_backend.bat             # Batch para iniciar servidor detectando IP Wi-Fi
└── index.html                      # Vista principal con FAB y marca de agua
```

---

## 🎨 2. Identidad Visual y Estética Agronómica

Siguiendo el diseño del **Proyecto Siembras**, la paleta de colores y componentes visuales se estructuran en torno a:

| Token | Hex | Aplicación en Interfaz |
| :--- | :--- | :--- |
| **Verde Primario Siembras** | `#7CB342` | Botón Flotante (+), acciones principales, estados confirmados |
| **Verde Oliva Profundo** | `#33691E` | Títulos principales, cabeceras de tablas (`th`), badges activos |
| **Fondo Agronómico Suave** | `#F9FBE7` | Fondo base de la app móvil y modo campo |
| **Verde Badge Pastel** | `#DCEDC8` | Fondo de estados `ACTIVO` y `Listo para Carga` |
| **Ámbar Candado / Alerta** | `#FFA000` | Candado dorado de inmutabilidad (48h) y sync pendiente |
| **Rojo Sanitario** | `#D32F2F` | Mortalidad y retiros farmacológicos |

### Componentes Clave Replicados
1. **Botón Flotante FAB (+):** Círculo en esquina inferior derecha (`#7CB342`, borde blanco de 2.5px y sombra elevada). Al tocarlo despliega el menú rápido de acciones de campo.
2. **Marca de Agua Sutil (`FirmaWatermark`):** Ubicada en la esquina inferior izquierda con opacidad del 22-24%, flotante e inalterable.
3. **Cuadro de Honor / Podio de Medallas:** 🥇 Oro, 🥈 Plata y 🥉 Bronce reconociendo a los galpones con mejor IEP y tasa de postura.
4. **Regla de Inmutabilidad de 48 Horas:** Todo registro puede editarse o eliminarse en el dispositivo durante 48 horas. Cumplido el plazo, se bloquea con candado dorado reservando cualquier cambio a la oficina central.

---

## 🚀 3. Modo de Puesta en Marcha

### 1. Iniciar el Servidor Backend (FastAPI):
Hacer doble clic en `iniciar_backend.bat` o ejecutar:
```bash
python backend/run.py
```
El servidor escuchará en el puerto 8000 y expondrá su documentación interactiva en:
`http://localhost:8000/docs`

### 2. Iniciar la Aplicación Web (Vite):
```bash
npm run dev
```
Disponible en `http://localhost:3000`.

### 3. Sincronización Local-First:
Al hacer clic en el indicador de sincronización en la barra superior o en el botón flotante (+), la aplicación se comunica directamente con `http://localhost:8000/api/v1/sync`, enviando los registros acumulados y respaldándolos en SQLite.
