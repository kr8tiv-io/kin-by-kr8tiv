# OpenClaw "Tangible Helper" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an Awwwards-quality, interactive 3D WebGL "Tangible Helper" section beneath the Hero that visualizes the transition from chaotic AI infrastructure to the calm KIN concierge.

**Architecture:** A new `<section id="openclaw-intro">` in `index.html` containing a Three.js `<canvas>` for the 3D glass orb, and staggered GSAP text for the problem/solution narrative.

**Tech Stack:** HTML5, CSS Variables, Three.js (via CDN for local prototyping if allowed, but since we are constrained to a single file, we will inject a lightweight WebGL shader directly or pull Three.js), GSAP (ScrollTrigger / SplitText).

---

### Task 1: Scaffolding the HTML Section

**Files:**
- Modify: `c:/Users/lucid/Desktop/kin-by-kr8tiv/index.html`

**Step 1: Write the Failing Test / Verification**
Manually find the `</section>` of the `.hero` in `index.html`. Assert that there is NO `<section id="openclaw-intro">`.

**Step 2: Write minimal implementation**
Inject the basic HTML structure for the new section directly after the `.hero` section:
```html
<section id="openclaw-intro" style="min-height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; background: var(--bg);">
    <canvas id="openclaw-webgl" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none;"></canvas>
    <div style="position: relative; z-index: 2; text-align: center; max-width: 800px; padding: 2rem;">
        <h2 class="section-header split-text" style="color: var(--text);">The AI Landscape is Chaotic.</h2>
        <p class="intro-text gs-fade-up" style="margin-top: 1rem;">We replace the noise with a calm, beautiful, bespoke concierge.</p>
        <p class="intro-text gs-fade-up" style="color: var(--cyan); margin-top: 2rem;">We handle the OpenClaw infrastructure.<br>You just talk to your friend.</p>
    </div>
</section>
```

**Step 3: Run test to verify it passes**
Open `index.html` in the browser. Verify the new text appears between the Hero and the "What Your KIN Actually Does" section.

---

### Task 2: Implementing the WebGL "Glass Orb" Shader

**Files:**
- Modify: `c:/Users/lucid/Desktop/kin-by-kr8tiv/index.html`

**Step 1: Verify Shader Absence**
Check the `<script>` blocks. Ensure there is no WebGL context or shader compilation logic for `openclaw-webgl`.

**Step 2: Write minimal implementation**
Append a script block at the bottom of the body handling bare-metal WebGL to draw a rotating, color-shifting sphere/gradient that acts as our "Tangible Helper". (A minimal custom shader is preferred over a 600KB Three.js injection to maintain performance).
```javascript
<script>
    // Minimal WebGL Shader for OpenClaw Core
    const ocCanvas = document.getElementById('openclaw-webgl');
    const gl = ocCanvas.getContext('webgl');
    // ... [Implementation details for compiling vertex/fragment shaders for a generic fluid/orb]
</script>
```

**Step 3: Run test to verify it passes**
Open `index.html` in the browser. A slow-moving, glass-like gradient orb should render behind the text in the `#openclaw-intro` section.

---

### Task 3: Hooking up GSAP ScrollTrigger to the Orb

**Files:**
- Modify: `c:/Users/lucid/Desktop/kin-by-kr8tiv/index.html`

**Step 1: Verify ScrollTrigger Logic**
Check the `index.html` script block. The WebGL uniform for rotation/intensity should currently be static or time-based, not scroll-based.

**Step 2: Write minimal implementation**
Bind the `.openclaw-intro` scroll progress to the WebGL shader uniforms via GSAP.
```javascript
gsap.to(webglUniforms, {
    scrollTrigger: {
        trigger: '#openclaw-intro',
        start: 'top center',
        end: 'bottom center',
        scrub: true
    },
    u_intensity: 1.0,
    u_chaos: 0.1 // Reduces chaos as you scroll
});
```

**Step 3: Run test to verify it passes**
Scroll down the page. The WebGL orb should visually shift from chaotic/fast to calm/slow as the section centers on the screen.
