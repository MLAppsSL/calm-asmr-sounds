
# Calm Sounds Mini – Product Requirements Document (PRD)

**Categoría:** Bienestar / ASMR / Sonidos relajantes  
**Versión:** MVP v1.0  
**Fecha:** Enero 2026  

---

## 1. Visión del Producto

Crear una app móvil minimalista y sin distracciones que ofrezca sonidos relajantes ultra-cortos (1 a 3 minutos) para ayudar a usuarios a dormir, estudiar o concentrarse.

**Hook:**  
> “Un minuto de calma cuando lo necesitas.”

La app prioriza simplicidad extrema, experiencia inmersiva y cero fricción.

---

## 2. Problema

Las apps actuales de sonidos relajantes:

- Ofrecen demasiadas opciones
- Tienen interfaces saturadas
- Generan interrupciones (notificaciones, upsells agresivos)
- No priorizan la experiencia emocional

Resultado: el usuario quiere calmarse… pero la app lo estimula.

---

## 3. Misión

Diseñar una experiencia móvil que entregue calma inmediata en menos de 3 toques.

Regla central:  
**No más de 3 acciones para empezar a relajarse.**

---

## 4. Público Objetivo

- Estudiantes que buscan concentración
- Personas con ansiedad leve
- Profesionales que trabajan con ruido blanco
- Personas con problemas de sueño
- Usuarios que quieren micro-momentos de descanso

---

## 5. Propuesta de Valor

- Sonidos ultra-cortos (1–3 min)
- Reproducción inmediata
- Loop mode opcional
- Modo pantalla completa inmersivo
- Bloqueo opcional de notificaciones
- Interfaz minimalista sin distracciones

---

## 6. Funcionalidades del MVP

### Core Features

- Biblioteca de 15–30 sonidos
- Reproducción automática
- Temporizador configurable (1–3 min)
- Loop mode (repetición infinita hasta detener)
- Favoritos
- Modo pantalla completa
- Opción “No molestar” mientras esté activa
- Modo oscuro
- Contenido free + premium

---

## 7. Flujo Principal del Usuario

### Relajarse rápidamente
1. Abre la app  
2. Selecciona un sonido  
3. Comienza la reproducción automática  

### Guardar favorito
1. Toca icono estrella  
2. Confirmación visual  
3. Se guarda en favoritos  

### Activar modo inmersivo
1. Reproduce sonido  
2. Activa pantalla completa  
3. UI desaparece, solo fondo + audio  

---

## 8. Arquitectura Técnica

### Frontend
- React Native (Expo recomendado)
- Diseño mobile-first

### Backend (Firebase)
- Authentication (opcional)
- Firestore (usuarios + favoritos)
- Storage (archivos de audio)
- Analytics (KPIs)

---

## 9. Modelo de Datos (Conceptual)

### User
- id
- email (opcional)
- favoritos[]

### Sound
- id
- nombre
- categoría
- duración
- url
- acceso (free / premium)

---

## 10. Diseño & Experiencia

### Tono emocional
Calmado, cálido, deliberado.

### Principios
- 1 función por pantalla
- 3 toques máximo
- Espacios generosos
- Animaciones suaves (150–250ms)
- Colores suaves y neutros

### Paleta Base
- Fondo claro: #F9FAF9
- Accent calmado: #6FB3B8
- Premium dorado suave: #D3AE78
- Dark mode: #111416

---

## 11. Monetización

Modelo Freemium:

- Acceso limitado gratuito
- Suscripción mensual premium
- Sonidos exclusivos desbloqueables

---

## 12. KPIs Clave

- Retención D1 y D7
- Duración promedio de sesión
- Número de favoritos guardados
- Conversión a premium
- Uso de loop mode

---

## 13. Roadmap

### MVP (2–3 semanas)
- 15 sonidos
- Core features completas
- UI minimalista
- Loop mode

### v1.1
- Mejoras animación
- Recordatorios
- Optimización ASO

### v2.0
- Recomendaciones personalizadas
- Estadísticas personales
- Compartir sonidos
- Widgets

---

## 14. Riesgos

- Sobrecargar la UI → mantener minimalismo estricto
- Problemas copyright → usar solo sonidos propios o libres
- Peso excesivo → optimizar compresión
- Pérdida foco emocional → test mensual de usuarios

---

## 15. Diferenciadores

- Sonidos ultra-cortos
- Loop inmediato
- Bloqueo opcional de notificaciones
- Diseño centrado en calma real
- Experiencia inmersiva limpia

---

## 16. Principio Rector

No optimizamos por engagement.
Optimizamos por calma.

