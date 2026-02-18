## Calm Sounds Mini – Design Guidelines

---

### 🌬️ Emotional Thesis  
**Se siente como abrir la ventana en una cabaña silenciosa en la mañana.**  
Todo está diseñado para ser mínimo, cálido y deliberadamente suave. Cada detalle busca calmar sin pedir atención.

---

### 🅰️ Typography

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|--------|
| H1 | San-serif moderno | 28–32 px | Semibold | Nombre de ambiente |
| H2 | San-serif ligero | 22–24 px | Regular | Títulos secundarios |
| Body | San-serif redondeado | 16–18 px | Regular | Descripción o botones |
| Caption | Mono o sans | 12–14 px | Light | Duración, estado (premium, loop) |

- Modular scale (1.25×) para mantener ritmo armónico
- Línea base 1.5× para respirabilidad

---

### 🎨 Color System

- **Primary (fondo):** `#F9FAF9` (RGB 249,250,249) – neutral cálido
- **Accent (interacción):** `#6FB3B8` (RGB 111,179,184) – verde-azul suave
- **Premium lock:** `#D3AE78` – dorado mate
- **Dark mode fondo:** `#111416`
- **Semantic success:** `#A3D9A5`
- **Semantic warning:** `#FFD591`

Todos los colores mantienen contraste AA+ mínimo de 4.5:1

---

### 📏 Spacing & Layout

- 8pt grid base
- Padding vertical mínimo: 16pt
- Botones: 48pt de alto
- Breakpoints:
  - Mobile (base): ≤ 375px
  - Tablet: 768px+
  - Layout mobile-first, con flexbox vertical

---

### 🎞️ Motion & Interaction

- Transiciones suaves (150–250ms)
- Easing: `ease-in-out`  
- Microinteracciones:
  - Botón pulsa ligeramente al tocar
  - Fade-in de fondo al iniciar sonido
  - Temporizador se desliza hacia arriba al activarse

**Modo pantalla completa**  
Desvanece el UI, deja solo fondo + barra de tiempo flotante

---

### 🗣️ Voice & Tone

**Emocional:** Cálido, mínimo, alentador  
**Microcopy ejemplos:**

- **Onboarding:** “Toca un sonido. Respira.”  
- **Éxito:** “Tu momento de calma ha comenzado.”  
- **Error:** “Algo interrumpió el sonido. ¿Volvemos a intentarlo?”

---

### ♻️ System Consistency

- Botones redondeados y planos (sin sombras)
- Tarjetas de sonido con ilustración suave + nombre
- Usar mismos paddings y fuentes en onboarding, lista y pantalla de reproducción

**Ancla visual:** mezcla entre **Apple Health** (minimalismo) y **Headspace** (amabilidad)

---

### ♿ Accesibilidad

- Todo texto con contraste AA+ mínimo
- Navegación 100% con teclado habilitada (si aplica)
- Roles ARIA en botones, tarjetas y sliders
- Indicadores de foco visibles
- Evitar transiciones que puedan provocar mareo (sin scroll lateral veloz)

---

### ✅ Emotional Audit Checklist

- ¿La app transmite calma desde la primera pantalla? ✅  
- ¿El usuario se siente apoyado, no juzgado, al usarla? ✅  
- ¿Los errores guían en vez de regañar? ✅  
- ¿Hay suficiente espacio visual para no abrumar? ✅

---

### 🧪 Technical QA Checklist

- Tipografía respeta ritmo y escala
- Contraste ≥ 4.5:1 en todos los estados
- Estados interactivos visibles (hover, tap)
- Animaciones duran 150–300ms, no más

---

### 📸 Design Snapshot Output

#### 🎨 Color Palette

```markdown
#F9FAF9 – Soft Background  
#6FB3B8 – Calm Accent  
#D3AE78 – Premium Gold  
#111416 – Dark Mode  
#A3D9A5 – Success  
#FFD591 – Warning  