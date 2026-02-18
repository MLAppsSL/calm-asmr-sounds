
## Calm Sounds Mini – Masterplan

### 🎯 Elevator Pitch
Una app móvil que ofrece sonidos relajantes ultra-cortos (1–3 minutos) con una experiencia visual inmersiva y sin distracciones. Diseñada para calmarte en segundos, cuando más lo necesitas.

**“Un minuto de calma cuando lo necesitas.”**

---

### 🧠 Problema & Misión

**Problema:**  
Las apps actuales de sonido relajante están sobrecargadas: demasiadas opciones, interfaces saturadas, y constantes interrupciones.

**Misión:**  
Crear una app ultra simple y elegante que proporcione calma instantánea a través de sonidos breves, sin fricción y con una estética que inspire paz.

---

### 🎯 Público Objetivo

- Personas con ansiedad o estrés
- Estudiantes que buscan concentración
- Profesionales que trabajan con ruido blanco
- Usuarios con insomnio o dificultad para relajarse

---

### ✨ Core Features

- Biblioteca de sonidos relajantes (15–30)
- Reproducción instantánea al seleccionar
- Temporizador (1–3 min)
- Loop mode (repetir sonido hasta detener manualmente)
- Favoritos
- Modo pantalla completa
- Bloqueo opcional de notificaciones
- UI minimalista (sin distracciones)
- Acceso limitado gratuito + opción premium

---

### ⚙️ Tech Stack (y por qué)

- **React Native**  
  Permite desarrollo rápido y uniforme para iOS y Android. Ideal para MVP ágil.

- **Firebase**  
  - Auth: inicio de sesión simple (opcional)
  - Storage: hosting rápido para archivos de audio
  - Analytics: trackeo de KPIs clave
  - Firestore: favoritos por usuario

---

### 🗂️ Conceptual Data Model (ERD en palabras)

- **User**
  - ID
  - Email (opcional)
  - Favoritos [array de SoundID]

- **Sound**
  - ID
  - Nombre
  - Categoría (lluvia, fuego, etc.)
  - URL (Firebase Storage)
  - Duración (1–3 min)
  - Tipo de acceso (free / premium)

---

### 🎨 UI Design Principles

- **Minimalismo funcional**  
  Un solo gesto = una acción. Nada más.

- **Primero la calma**  
  Uso de colores suaves, animaciones lentas y sin sobrecargas.

- **Modo inmersivo**  
  Pantalla completa para eliminar distracciones.

- **Tres toques como máximo** para cualquier función (ver, reproducir, ajustar).

Inspirado en Krug: *“Don’t make me think.”*

---

### 🔐 Seguridad & Cumplimiento

- Solo sonidos propios o libres de copyright
- Datos mínimos del usuario (solo email, si aplica)
- Firebase con reglas de seguridad activadas
- No se almacena ni comparte información sensible

---

### 🛣️ Roadmap

**MVP (v1.0)** – 2 a 3 semanas  
- 15 sonidos
- Core features (reproducir, favoritos, temporizador)
- UI inmersiva
- Modo sin notificaciones

**v1.1**  
- Mejora UX (animaciones, feedback visual)
- Sistema de recordatorios
- Optimización ASO

**v2.0**  
- Social sharing de sonidos
- Recomendaciones personalizadas
- Estadísticas de uso personal

---

### ⚠️ Riesgos & Mitigaciones

- **Saturar la interfaz** → regla de oro: 1 función por pantalla
- **Problemas de derechos de autor** → solo sonidos 100% propios o libres
- **Pérdida de foco visual** → test de usabilidad mensuales
- **Peso excesivo de la app** → compresión sin perder calidad

---

### 🌱 Ideas Futuras

- Recomendaciones según uso
- Estadísticas de calma personalizada
- Integración con Apple Health / Google Fit
- Widget de sonidos rápidos desde lockscreen
- Suscripciones tipo regalo (enviar calma a alguien)
