
## Calm Sounds Mini – Implementation Plan

### 🛠️ Build Sequence (micro-tareas paso a paso)

**1. Setup inicial**
- Crear repositorio (GitHub / GitLab)
- Configurar proyecto React Native (Expo recomendado)
- Integrar Firebase (Auth, Firestore, Storage)

**2. Datos y contenidos**
- Subir primeros 15 sonidos a Firebase Storage
- Crear estructura de datos para sonidos en Firestore
- Marcar cada sonido como "free" o "premium"

**3. Interfaz básica**
- Pantalla de inicio con lista de sonidos
- Filtro visual por ambiente (lluvia, bosque, etc.)
- Selector de duración (1–3 minutos)
- Modo pantalla completa (UI oculta durante reproducción)

**4. Funcionalidades core**
- Reproducción automática al tocar sonido
- Temporizador
- Loop mode (repetir sonido hasta detener manualmente)
- Agregar a favoritos
- Activar / desactivar modo sin notificaciones

**5. Cuenta y datos del usuario**
- Iniciar sesión (opcional)
- Guardar favoritos en Firestore
- Detectar usuarios anónimos vs registrados

**6. Experiencia visual**
- Animaciones suaves al seleccionar sonido
- Fondo visual sutil según ambiente (lluvia = niebla, fuego = resplandor cálido)
- Modo oscuro por defecto

**7. Monetización (base para v1.1)**
- Mostrar sonidos bloqueados con ícono de “premium”
- Pantalla de suscripción (sin lógica de pago aún)

**8. Analítica y QA**
- Trackear eventos clave: reproducción, favoritos, duración
- Pruebas en TestFlight (iOS) y Android
- Feedback interno + test guerrilla

---

### ⏱️ Timeline con Checkpoints

**Semana 1**  
- Setup completo + Firebase  
- 15 sonidos listos  
- UI básica funcional

**Semana 2**  
- Temporizador, loop, favoritos, pantalla completa  
- Modo sin notificaciones  
- Autenticación (opcional)

**Semana 3**  
- Animaciones + estilos  
- Analytics + revisión de KPIs  
- QA y ajustes finales

---

### 👥 Team Roles & Rituals

- **1 Dev React Native**: lógica, UI, reproducción
- **1 Diseñador UI/UX**: wireframes, visual, microcopy
- **1 PM/QA** *(puede ser el mismo dev)*: tareas, testeo

**Rituales recomendados**
- Check-in diario de 15 minutos
- Demo interna semanal
- 1 test de usuario rápido por semana (guerrilla)

---

### 🔌 Integraciones opcionales & stretch goals

- Apple Health / Google Fit (tiempo de relajación)
- Recordatorios con notificaciones push
- Widget de reproducción rápida
- Compartir sonidos favoritos (post-MVP)
