# OpenClaw "Tangible Helper" Section Design

## Overview
This document outlines the design for the new "Problem/Solution OpenClaw" section of the KIN landing page, placed underneath the hero section. We are adopting the "Tangible Helper" visual metaphor to create an Awwwards-quality, emotional, and highly interactive experience that leverages WebGL/3JS.

## Problem Statement
AI is advancing rapidly, creating a chaotic landscape of models, endpoints, and server infrastructure. Most people are left behind, unable to keep up with the technical overhead of running their own AI.

## The Solution (KIN & OpenClaw)
We replace the chaos with a calm, beautiful, bespoke AI concierge. KR8TIV handles the OpenClaw infrastructure (servers, APIs, context management) so the user only ever interacts with their "friend".

## Visual Metaphor: "The Tangible Helper"
*   **Core Element:** A centralized, 3D glassmorphic "OpenClaw core" or futuristic pod.
*   **Aesthetics:** High-gloss, refracting light naturally. Built likely via a WebGL/Three.js `<canvas>` or highly advanced CSS 3D transforms with backdrop filters if WebGL is too heavy. Given the Awwwards constraint, a lightweight Three.js integration is preferred.
*   **Interaction:**
    *   Slow, elegant rotation on idle.
    *   Reacts softly to mouse movements (parallax/tilt).
    *   As the user scrolls into the section, chaotic text/elements (representing the "problem") fade out, and the core illuminates, bringing in clean, minimal "solution" text.

## Architecture & Components
1.  **Section Container (`<section id="openclaw-intro">`)**: Full viewport height, dark background matching the established theme.
2.  **3D Canvas (`<canvas id="openclaw-core">`)**: Absolute positioned, taking up the central visual weight.
3.  **Text Overlay (`.split-text`)**: Staggered typography appearing using the existing GSAP SplitText logic.
    *   *Problem Text:* "The AI landscape is chaotic."
    *   *Solution Text:* "Your KIN is calm. We handle the OpenClaw infrastructure. You just talk to your friend."

## Data Flow & State
*   **ScrollTrigger:** Drives the lighting intensity and rotation speed of the 3D core.
*   **Mouse Move:** Updates uniforms in the WebGL shader for dynamic refraction/reflection.

## Approval
Approved via auto-proceed policy. Transitioning to `writing-plans` phase.
