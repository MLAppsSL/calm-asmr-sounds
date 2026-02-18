# Calm Sounds Mini

## What This Is

Una app móvil minimalista que ofrece sonidos relajantes ultra-cortos (1–3 minutos) con una experiencia visual inmersiva y sin distracciones. Diseñada para entregar calma instantánea en menos de 3 toques, para personas con estrés, ansiedad, insomnio o que buscan concentración. El principio rector: **no optimizamos por engagement, optimizamos por calma.**

## Core Value

El usuario abre la app, toca un sonido, y está relajándose en menos de 3 toques — sin menús confusos, sin interrupciones, sin fricción.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Biblioteca de 15–30 sonidos relajantes categorizados por ambiente (lluvia, fuego, bosque, etc.)
- [ ] Reproducción automática al seleccionar un sonido
- [ ] Temporizador configurable (1–3 minutos)
- [ ] Loop mode (repetición infinita hasta detener manualmente)
- [ ] Modo pantalla completa inmersivo (UI desaparece, solo fondo + audio)
- [ ] Favoritos (locales para anónimos, sincronizados en nube para registrados)
- [ ] Bloqueo opcional de notificaciones durante reproducción
- [ ] Modo oscuro por defecto
- [ ] Acceso freemium: sonidos gratuitos + sonidos premium bloqueados
- [ ] Onboarding de primera vez ("Toca un sonido. Respira.")
- [ ] Autenticación opcional (email) para sincronización de favoritos
- [ ] Fondo visual dinámico según ambiente del sonido
- [ ] Firebase Analytics para tracking de KPIs clave

### Out of Scope

- Social sharing — diferenciador para v2.0
- Recomendaciones personalizadas — requiere datos suficientes, v2.0
- Apple Health / Google Fit — integración de salud, post-MVP
- Widget de lockscreen — complejidad nativa, post-MVP
- Lógica de pago real (Stripe/IAP) — pantalla de suscripción en MVP es visual, sin backend de pagos
- Chat o comunidad — fuera de la misión de calma individual

## Context

- El mercado de apps de bienestar/ASMR tiene players como Calm, Headspace, y Endel — todos sobrecargados o caros
- La diferencia es la radicalidad del minimalismo: 1 función por pantalla, 3 toques máximo, sonidos ultra-cortos
- Inspiración visual: mezcla entre Apple Health (minimalismo) y Headspace (amabilidad)
- Filosofía de diseño: "Don't make me think" (Krug)
- Todos los sonidos deben ser propios o libres de copyright (sin riesgo legal)

## Constraints

- **Tech Stack**: React Native con Expo — para desarrollo rápido cross-platform iOS/Android
- **Backend**: Firebase (Auth + Firestore + Storage + Analytics) — ya definido en PRD
- **Audio**: Solo sonidos 100% libres de copyright o propios — restricción legal
- **UX**: Máximo 3 toques para cualquier función core — regla de diseño no negociable
- **Performance**: App ligera, audio comprimido sin pérdida perceptible de calidad
- **MVP Timeline**: 2–3 semanas
- **Accesibilidad**: Contraste AA+ mínimo 4.5:1, roles ARIA, foco visible

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native + Expo | Desarrollo rápido cross-platform, ideal para MVP ágil | — Pending |
| Firebase como backend | Auth + Storage + Firestore + Analytics en un solo servicio gestionado | — Pending |
| Freemium (no ads) | Los anuncios rompen la experiencia de calma; la suscripción alinea incentivos | — Pending |
| Sonidos ultra-cortos (1–3 min) | Diferenciador clave vs. apps con loops infinitos genéricos | — Pending |
| Autenticación opcional | No forzar login elimina fricción; favoritos locales como fallback | — Pending |
| Modo oscuro por defecto | El 80%+ de apps de bienestar van dark-first; reduce fatiga visual nocturna | — Pending |

---
*Last updated: 2026-02-18 after initialization from docs/*
