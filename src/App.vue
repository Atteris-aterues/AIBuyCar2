<template>
  <div id="app" class="crt-bg">
    <div class="scanlines"></div>
    <div class="vignette"></div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Global Cyberpunk/CRT Theme */
:root {
  --bg: #020b0a;
  --bg-deep: #000405;
  --grid: rgba(0, 255, 170, 0.06);
  --neon: #00ff9c;
  --neon-2: #38bdf8;
  --amber: #ffb000;
  --text: #b7ffcf;
  --muted: #5cffc0;
  --error: #ff6b6b;
}
html, body, #app {
  height: 100%;
  margin: 0;
}
body {
  background: var(--bg);
  color: var(--text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  text-shadow: 0 0 1px rgba(0, 255, 156, 0.35);
}
#app {
  position: relative;
  overflow: hidden;
}
.crt-bg::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 2%, transparent 3%) repeat-y,
    radial-gradient(1200px 600px at 20% -10%, rgba(0,255,156,0.12), transparent 60%),
    radial-gradient(1200px 600px at 100% 0%, rgba(56,189,248,0.12), transparent 60%),
    linear-gradient(to right, var(--grid) 1px, transparent 1px) 0 0/40px 40px,
    linear-gradient(to bottom, var(--grid) 1px, transparent 1px) 0 0/40px 40px;
  pointer-events: none;
}
.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,0.03),
    rgba(255,255,255,0.03) 1px,
    transparent 2px,
    transparent 3px
  );
  mix-blend-mode: overlay;
  opacity: 0.15;
  pointer-events: none;
  animation: flicker 6s infinite steps(1, end);
}
.vignette {
  position: fixed;
  inset: 0;
  box-shadow: inset 0 0 150px rgba(0,0,0,0.65), inset 0 0 40px rgba(0,0,0,0.6);
  pointer-events: none;
}
@keyframes flicker {
  0%, 100% { opacity: 0.12; }
  5% { opacity: 0.17; }
  10% { opacity: 0.13; }
  15% { opacity: 0.18; }
  20% { opacity: 0.14; }
  25% { opacity: 0.16; }
  30% { opacity: 0.12; }
  35% { opacity: 0.2; }
  40% { opacity: 0.14; }
  50% { opacity: 0.18; }
  60% { opacity: 0.13; }
  70% { opacity: 0.16; }
  80% { opacity: 0.12; }
  90% { opacity: 0.19; }
}
/* Neon button baseline */
.btn-neon {
  position: relative;
  background: linear-gradient(135deg, var(--neon), var(--neon-2));
  color: #00110d;
  font-weight: 800;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform .08s ease, filter .2s ease, box-shadow .2s ease;
  box-shadow: 0 0 14px rgba(0,255,156,0.25), 0 0 28px rgba(56,189,248,0.15);
}
.btn-neon:active {
  transform: translateY(1px);
  filter: brightness(0.95);
}
/* Terminal-like input baseline */
.input-terminal {
  border: 1px solid rgba(0,255,156,0.25);
  background: rgba(0,17,13,0.7);
  color: var(--text);
  box-shadow: inset 0 0 12px rgba(0,255,156,0.08);
}
.input-terminal:focus {
  border-color: var(--neon);
  box-shadow: 0 0 0 3px rgba(0,255,156,0.18), inset 0 0 12px rgba(0,255,156,0.12);
}
.glitch-title {
  position: relative;
  text-transform: uppercase;
  text-shadow:
    0 0 6px rgba(0,255,156,0.6),
    0 0 24px rgba(56,189,248,0.4);
}
.glitch-title::before,
.glitch-title::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  clip-path: inset(0 0 0 0);
  opacity: 0.7;
}
.glitch-title::before {
  transform: translate(2px, 0);
  color: var(--neon);
  animation: glitch 2.2s infinite linear alternate-reverse;
}
.glitch-title::after {
  transform: translate(-2px, 0);
  color: var(--neon-2);
  animation: glitch 2.8s infinite linear alternate-reverse;
}
@keyframes glitch {
  0% { clip-path: inset(0 0 90% 0); }
  20% { clip-path: inset(0 0 15% 0); }
  40% { clip-path: inset(0 0 60% 0); }
  60% { clip-path: inset(0 0 25% 0); }
  80% { clip-path: inset(0 0 70% 0); }
  100% { clip-path: inset(0 0 10% 0); }
}
</style>



