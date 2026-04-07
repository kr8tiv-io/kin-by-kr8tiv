import re

with open('c:/Users/lucid/Desktop/kin-by-kr8tiv/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to keep everything before `<style>`
head_end_idx = content.find('<style>')
if head_end_idx == -1:
    print("Could not find <style>")
    exit(1)

head_and_scripts = content[:head_end_idx]

body_content = """<style>
/* CSS RESET & VARIABLES */
:root {
    --bg: #000000;
    --surface: #0a0a0a;
    --surface-hover: #141414;
    --text: #ffffff;
    --text-muted: rgba(255, 255, 255, 0.6);
    --border: rgba(255, 255, 255, 0.1);
    --cyan: #00f0ff;
    --magenta: #ff00aa;
    --gold: #ffd700;
    --apple-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --disney-font: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.light-mode {
    --bg: #f5f5f7;
    --surface: #ffffff;
    --surface-hover: #f0f0f0;
    --text: #1d1d1f;
    --text-muted: rgba(0, 0, 0, 0.6);
    --border: rgba(0, 0, 0, 0.1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
    background-color: var(--bg);
    color: var(--text);
    font-family: var(--apple-font);
    overflow-x: hidden;
    cursor: none;
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.8s ease, color 0.8s ease;
}

/* NOISE VENEER */
.noise {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    pointer-events: none; z-index: 9999;
    opacity: 0.04;
    background-image: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
}
.light-mode .noise { opacity: 0.08; }

/* CUSTOM CURSOR */
.cursor-dot {
    width: 8px; height: 8px;
    background: var(--cyan);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 10000;
    mix-blend-mode: difference;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, background 0.3s;
}
.cursor-ring {
    width: 40px; height: 40px;
    border: 1px solid var(--magenta);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: difference;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, border-color 0.3s;
}
.cursor-hover .cursor-dot {
    width: 60px; height: 60px;
    background: var(--magenta);
    mix-blend-mode: color-dodge;
    opacity: 0.5;
}
.cursor-hover .cursor-ring {
    width: 80px; height: 80px;
    border-color: var(--cyan);
    opacity: 0;
}

/* TYPOGRAPHY */
h1, h2, h3, h4 { font-family: var(--disney-font); font-weight: 800; letter-spacing: -0.04em; }
p { font-size: 1.15rem; line-height: 1.6; color: var(--text-muted); }
.split-text-wrap { overflow: hidden; display: inline-block; vertical-align: bottom; }
.split-text-char { display: inline-block; transform: translateY(120%); opacity: 0; }

.section-header { font-size: clamp(3rem, 6vw, 6rem); text-align: center; margin-bottom: 2rem; color: var(--gold); }
.intro-text { text-align: center; max-width: 800px; margin: 0 auto 5rem; font-size: 1.5rem; }

/* NAV & UTILS */
nav { position: fixed; top: 0; width: 100%; padding: 2rem 4rem; display: flex; justify-content: space-between; align-items: center; z-index: 100; mix-blend-mode: difference; color: #fff; }
nav .logo { font-family: var(--disney-font); font-weight: 800; font-size: 1.8rem; color: var(--gold); letter-spacing: -0.05em; }
nav .nav-right { display: flex; align-items: center; gap: 2rem; }
.mode-toggle { display: flex; align-items: center; gap: 10px; cursor: none; }
.mode-toggle-pill { width: 44px; height: 24px; background: rgba(255,255,255,0.2); border-radius: 50px; position: relative; border: 1px solid rgba(255,255,255,0.1); }
.mode-toggle-knob { width: 18px; height: 18px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.light-mode .mode-toggle-pill { background: rgba(0,0,0,0.2); border-color: rgba(0,0,0,0.1); }
.light-mode .mode-toggle-knob { left: 22px; background: #000; }

.cta-magnetic {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 1.2rem 3rem;
    border: 1px solid var(--border);
    border-radius: 100px;
    color: var(--text);
    font-family: var(--disney-font); font-size: 1.1rem; font-weight: 600; text-transform: uppercase; text-decoration: none;
    cursor: none;
    position: relative; overflow: hidden;
    backdrop-filter: blur(10px);
    transition: border-color 0.4s ease, background 0.4s ease, color 0.4s ease;
}
.cta-magnetic::before { content: ''; position: absolute; top:0; left:0; width:100%; height:100%; background: var(--cyan); transform: translateY(100%); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); z-index: -1; border-radius: 100px; }
.cta-magnetic:hover::before { transform: translateY(0); }
.cta-magnetic:hover { color: #000; border-color: var(--cyan); }

.cta-primary { border-color: var(--magenta); color: var(--magenta); }
.cta-primary::before { background: var(--magenta); }
.cta-primary:hover { color: #fff; border-color: var(--magenta); box-shadow: 0 0 30px rgba(255,0,170,0.4); }

/* SECTIONS */
section { padding: 15vh 4vw; position: relative; z-index: 2; }

/* HERO */
#hero-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; opacity: 0.6; }
.light-mode #hero-canvas { opacity: 0.2; filter: invert(1); }
.hero { min-height: 100vh; display: flex; align-items: center; justify-content: space-between; padding-top: 15vh; }
.hero-content { flex: 1; max-width: 55vw; }
.hero-title { font-size: clamp(4rem, 8vw, 10rem); line-height: 0.85; margin-bottom: 2rem; color: var(--text); text-transform: uppercase; }
.hero-subtitle { font-size: clamp(1.2rem, 2vw, 1.8rem); opacity: 0.9; margin-bottom: 3rem; max-width: 600px; }
.hero-image-container { flex: 1; display: flex; justify-content: flex-end; perspective: 1000px; }
.hero-image-wrapper { width: 100%; max-width: 500px; border-radius: 30px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.2); }
.living-img { width: 100%; display: block; filter: contrast(1.1) saturate(1.2); }

/* CARDS */
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; max-width: 1400px; margin: 0 auto; }
.card { background: rgba(10, 10, 10, 0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 30px; padding: 3rem; transition: border-color 0.4s, background 0.4s; height: 100%; display: flex; flex-direction: column; transform-style: preserve-3d; }
.light-mode .card { background: rgba(255, 255, 255, 0.6); }
.card-content { transform: translateZ(30px); }
.card-icon { font-size: 3rem; margin-bottom: 1.5rem; }

/* HORIZONTAL SCROLL: BLOODLINES */
.genesis-scroll-container { width: 100vw; height: 100vh; overflow: hidden; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; background: var(--surface); display: flex; align-items: center; }
.genesis-track { display: flex; gap: 4rem; padding: 0 10vw; width: max-content; }
.creature-card { width: 400px; flex-shrink: 0; background: transparent; border-radius: 24px; position: relative; }
.creature-img-wrap { width: 100%; aspect-ratio: 4/5; border-radius: 20px; overflow: hidden; margin-bottom: 2rem; border: 1px solid var(--border); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
.creature-img { width: 100%; height: 100%; object-fit: cover; }
.creature-name { font-size: 2.5rem; color: var(--cyan); margin-bottom: 0.5rem; }
.creature-trait { font-family: var(--apple-font); font-size: 1.1rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 1rem; }

/* COMPARISON TABLE */
.comparison-wrap { overflow-x: auto; max-width: 1200px; margin: 0 auto; background: rgba(20, 20, 20, 0.4); border-radius: 30px; border: 1px solid var(--border); backdrop-filter: blur(10px); }
.light-mode .comparison-wrap { background: rgba(255, 255, 255, 0.4); }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 2rem 2.5rem; border-bottom: 1px solid var(--border); }
th { font-family: var(--disney-font); font-size: 1.4rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid var(--border); }
tr:last-child td { border-bottom: none; }
.highlight-row { background: linear-gradient(90deg, rgba(0,240,255,0.05) 0%, rgba(255,0,170,0.05) 100%); }
.highlight-row td { color: var(--text); font-weight: 500; font-size: 1.1rem; }
.highlight-row td:first-child { color: var(--cyan); font-size: 1.3rem; font-family: var(--disney-font); }

/* MINT & PRICING TICKETS */
.ticket-card { background: rgba(10, 10, 10, 0.8); border: 1px solid var(--border); border-radius: 30px; padding: 3rem; text-align: center; position: relative; overflow: hidden; }
.light-mode .ticket-card { background: rgba(255, 255, 255, 0.8); }
.ticket-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%); pointer-events: none; }
.ticket-card.premium { border-color: var(--magenta); box-shadow: 0 0 40px rgba(255,0,170,0.15); }
.ticket-card.premium::before { background: radial-gradient(circle, rgba(255,0,170,0.1) 0%, transparent 60%); }
.ticket-card.elite { border-color: var(--cyan); }
.ticket-card.elite::before { background: radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 60%); }
.price { font-size: 3.5rem; margin: 2rem 0; font-family: var(--disney-font); font-weight: 800; color: var(--text); }
.price span { font-size: 1.2rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.features { list-style: none; margin-bottom: 3rem; text-align: left; }
.features li { padding: 1rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; gap: 12px; font-size: 1.1rem; }
.features li::before { content: '✦'; color: var(--gold); font-size: 1.2rem; }

/* HOW IT WORKS */
.step-number { font-family: var(--disney-font); font-size: 8rem; color: transparent; -webkit-text-stroke: 1px var(--border); line-height: 0.8; margin-bottom: 1rem; transition: 0.4s; }
.card:hover .step-number { color: var(--cyan); -webkit-text-stroke: 0; text-shadow: 0 0 30px rgba(0,240,255,0.4); transform: scale(1.1); }

/* FOOTER */
footer { padding: 6rem 4vw 2rem; border-top: 1px solid var(--border); background: var(--surface); text-align: center; position: relative; z-index: 2; }
.footer-links { display: flex; justify-content: center; gap: 3rem; margin: 3rem 0; flex-wrap: wrap; }
.footer-links a { color: var(--text-muted); text-decoration: none; transition: color 0.3s; font-weight: 500; cursor: none; text-transform: uppercase; letter-spacing: 0.05em; }
.footer-links a:hover { color: var(--magenta); }

@media (max-width: 1024px) {
    .hero { flex-direction: column; text-align: center; }
    .hero-content { max-width: 100%; margin-bottom: 4rem; }
    .hero-image-container { display: flex; justify-content: center; width: 100%; }
    .genesis-track { padding: 0 5vw; gap: 2rem; }
    nav { padding: 1.5rem 2rem; }
}
@media (max-width: 768px) {
    .section-header { font-size: 3rem; }
    .creature-card { width: 300px; }
    th, td { padding: 1rem; font-size: 0.95rem; }
}
</style>
</head>
<body>
<div class="noise"></div>
<div class="cursor-dot"></div>
<div class="cursor-ring"></div>
<canvas id="hero-canvas"></canvas>

<nav>
    <div class="logo cta-magnetic">KIN</div>
    <div class="nav-right">
        <div class="mode-toggle cta-magnetic" onclick="toggleMode()">
            <span id="mode-label" style="font-size: 12px; font-weight: 600; text-transform: uppercase;">Dark</span>
            <div class="mode-toggle-pill">
                <div class="mode-toggle-knob"></div>
            </div>
        </div>
    </div>
</nav>

<section class="hero">
    <div class="hero-content">
        <h1 class="hero-title split-text" style="color: var(--cyan);">We build</h1>
        <h1 class="hero-title split-text">you a</h1>
        <h1 class="hero-title split-text" style="color: var(--magenta);">friend.</h1>
        <p class="hero-subtitle gs-fade-up">Everyone else sells you a server or a blank chat box. KIN is a bespoke, fully managed AI companion concierge service. Voice, Telegram, WhatsApp, and total computer control. Zero technical knowledge required.</p>
        <div class="gs-fade-up" style="display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: flex-start; margin-top: 2rem;">
            <a href="#mint" class="cta-magnetic cta-primary">The Genesis Mint</a>
            <a href="#how" class="cta-magnetic">How It Works</a>
        </div>
    </div>
    <div class="hero-image-container gs-fade-up">
        <div class="hero-image-wrapper gs-tilt">
            <img src="MKVt4.jpg" alt="Mischief - KIN Hero" class="living-img">
        </div>
    </div>
</section>

<section id="capabilities">
    <h2 class="section-header split-text">What Your KIN Actually Does</h2>
    <p class="intro-text gs-fade-up">ChatGPT is a search engine with a chat interface. It waits for you to type. A KIN is a personal employee, a companion, and a concierge that works while you sleep.</p>
    <div class="grid-3">
        <div class="card gs-tilt gs-stagger">
            <div class="card-content">
                <div class="card-icon">👨‍👩‍👧‍👦</div>
                <h3 style="color: var(--cyan); margin-bottom: 1rem; font-size: 2rem;">The Family Concierge</h3>
                <p>Reads your kids a bedtime story using their real names. Manages your family calendar, books flights, pays with your card securely, and remembers your partner's anniversary. Forever.</p>
            </div>
        </div>
        <div class="card gs-tilt gs-stagger">
            <div class="card-content">
                <div class="card-icon">📈</div>
                <h3 style="color: var(--magenta); margin-bottom: 1rem; font-size: 2rem;">The Digital Executive</h3>
                <p>Answers your emails while you sleep. Drafts responses, flags urgent messages, runs your social media presence, and keeps your brand voice perfectly consistent.</p>
            </div>
        </div>
        <div class="card gs-tilt gs-stagger">
            <div class="card-content">
                <div class="card-icon">💻</div>
                <h3 style="color: var(--gold); margin-bottom: 1rem; font-size: 2rem;">The Ghost in the Machine</h3>
                <p>With your permission, your KIN controls your computer directly. It can operate your browser, debug your codebase at 3am, open crypto wallets, and manage investments.</p>
            </div>
        </div>
    </div>
</section>

<section id="how">
    <h2 class="section-header split-text">Zero Tech Required</h2>
    <p class="intro-text gs-fade-up">We don't hand you an API key and wish you luck. This is a white-glove, bespoke concierge service.</p>
    <div class="grid-3">
        <div class="card gs-tilt gs-stagger" style="text-align: center;">
            <div class="card-content">
                <div class="step-number">1</div>
                <h3 style="margin: 1rem 0; font-size: 1.8rem;">Choose Your KIN</h3>
                <p>Select your bloodline and complete the Awakening Questionnaire so we can learn your life, your humor, and your needs.</p>
            </div>
        </div>
        <div class="card gs-tilt gs-stagger" style="text-align: center;">
            <div class="card-content">
                <div class="step-number">2</div>
                <h3 style="margin: 1rem 0; font-size: 1.8rem;">We Build It</h3>
                <p>We configure the OpenClaw infrastructure, hook up the APIs, manage the models, and connect it to your devices.</p>
            </div>
        </div>
        <div class="card gs-tilt gs-stagger" style="text-align: center;">
            <div class="card-content">
                <div class="step-number">3</div>
                <h3 style="margin: 1rem 0; font-size: 1.8rem;">Talk to Your Friend</h3>
                <p>Just open Telegram, WhatsApp, or speak out loud. Your KIN is there. If anything ever breaks, you call us. We fix it.</p>
            </div>
        </div>
    </div>
</section>

<section id="bloodlines" class="bloodlines-section">
    <div style="position: absolute; top: 10vh; width: 100%; text-align: center; left: 0;">
        <h2 class="section-header split-text" style="color: var(--magenta);">The Genesis Five</h2>
        <p class="intro-text gs-fade-up">Only these five bloodlines will ever exist as Genesis. Every future KIN descends from them.</p>
    </div>

    <div class="genesis-scroll-container">
        <div class="genesis-track">
            <!-- Mischief -->
            <div class="creature-card gs-tilt">
                <div class="creature-img-wrap"><img src="MKVt4.jpg" alt="Mischief" class="creature-img"></div>
                <h3 class="creature-name">Mischief</h3>
                <span class="creature-trait">Code Griffin</span>
                <p>The ultimate family companion & personal-brand whisperer. Tells bespoke bedtime stories, keeps the calendar, and helps you craft authentic social posts.</p>
            </div>
            <!-- Vortex -->
            <div class="creature-card gs-tilt">
                <div class="creature-img-wrap"><img src="EVh1Y.jpg" alt="Vortex" class="creature-img"></div>
                <h3 class="creature-name" style="color: var(--magenta);">Vortex</h3>
                <span class="creature-trait">Teal Dragon</span>
                <p>Your 24/7 CMO. Generates scroll-stopping content, schedules across all platforms, analyzes what's working, and keeps your brand voice perfect 24/7.</p>
            </div>
            <!-- Forge -->
            <div class="creature-card gs-tilt">
                <div class="creature-img-wrap"><img src="0mgOA.jpg" alt="Forge" class="creature-img"></div>
                <h3 class="creature-name" style="color: var(--gold);">Forge</h3>
                <span class="creature-trait">Cyber Hound</span>
                <p>The developer's best friend. Debugs code at 3 a.m., architects entire projects, writes clean documentation, and builds custom automations.</p>
            </div>
            <!-- Aether -->
            <div class="creature-card gs-tilt">
                <div class="creature-img-wrap"><img src="Dzqkh.jpg" alt="Aether" class="creature-img"></div>
                <h3 class="creature-name" style="color: #a855f7;">Aether</h3>
                <span class="creature-trait">Lavender Phoenix</span>
                <p>Infinite creative spark. Turns vague thoughts into polished scripts, newsletters, books, marketing copy, or magical stories. Your storytelling muse.</p>
            </div>
            <!-- Catalyst -->
            <div class="creature-card gs-tilt">
                <div class="creature-img-wrap"><img src="ZsrkF.jpg" alt="Catalyst" class="creature-img"></div>
                <h3 class="creature-name" style="color: #f97316;">Catalyst</h3>
                <span class="creature-trait">Fire Salamander</span>
                <p>Wealth & personal growth coach. Tracks habits, manages investments, automates repetitive life tasks, and runs your systems while you sleep.</p>
            </div>
        </div>
    </div>
</section>

<section id="compare">
    <h2 class="section-header split-text">The Reality Check</h2>
    <div class="comparison-wrap gs-fade-up">
        <table>
            <thead>
                <tr><th style="width:25%">What Exists</th><th style="width:25%">What They Offer</th><th style="width:15%">Price</th><th style="width:35%">What's Missing</th></tr>
            </thead>
            <tbody>
                <tr class="gs-stagger-row"><td>ChatGPT / Claude</td><td>Generic chatbot in a browser tab</td><td>$20/mo</td><td>Forgets you instantly. Cannot control your computer. No personality. You do all the work.</td></tr>
                <tr class="gs-stagger-row"><td>xCloud</td><td>Managed OpenClaw hosting</td><td>$24/mo</td><td>Just a server. No personalization, no onboarding. Figure it out yourself.</td></tr>
                <tr class="gs-stagger-row"><td>Self-Hosted AI</td><td>VPS + Docker + config</td><td>$10/mo</td><td>Requires DevOps knowledge. Most people give up in 30 minutes.</td></tr>
                <tr class="highlight-row gs-stagger-row"><td>KIN by KR8TIV</td><td>Bespoke AI Companion Concierge</td><td>$89+/mo</td><td>Nothing. We handle literally everything. You just talk to your friend.</td></tr>
            </tbody>
        </table>
    </div>
</section>

<section id="mint">
    <h2 class="section-header split-text" style="color: var(--cyan);">The Genesis Mint</h2>
    <p class="intro-text gs-fade-up">Strictly limited to 50 supply. Secure your KIN, your OpenClaw hosting, and your piece of the ecosystem.</p>

    <div class="grid-3" style="margin-bottom: 4rem;">
        <div class="ticket-card gs-tilt gs-stagger">
            <h3>Egg Tier</h3>
            <div class="price">2.2 <span>SOL</span></div>
            <ul class="features">
                <li>1x Genesis KIN Avatar</li>
                <li>1 Month Hatchling Hosting</li>
                <li>25% Lifetime Discount</li>
                <li>Founders Reward Tier</li>
            </ul>
            <a href="#" class="cta-magnetic" style="width:100%">Mint Egg</a>
        </div>
        <div class="ticket-card premium gs-tilt gs-stagger">
            <h3 style="color: var(--magenta);">Hatchling Tier</h3>
            <div class="price">4.5 <span>SOL</span></div>
            <ul class="features">
                <li>1x Genesis KIN Avatar</li>
                <li>3 Months Hatchling Hosting</li>
                <li>35% Lifetime Discount</li>
                <li>Medium Founders Reward Tier</li>
            </ul>
            <a href="#" class="cta-magnetic cta-primary" style="width:100%">Mint Hatchling</a>
        </div>
        <div class="ticket-card elite gs-tilt gs-stagger">
            <h3 style="color: var(--cyan);">Elder Tier</h3>
            <div class="price">7.5 <span>SOL</span></div>
            <ul class="features">
                <li>1x Genesis KIN Avatar</li>
                <li>3 Months Elder Hosting</li>
                <li>50% Lifetime Discount</li>
                <li>Highest Founders Reward Tier</li>
            </ul>
            <a href="#" class="cta-magnetic" style="width:100%">Mint Elder</a>
        </div>
    </div>

    <div class="grid-2" style="display:grid; grid-template-columns: 1fr 1fr; gap:3rem; max-width: 1200px; margin: 0 auto;">
        <div class="gs-fade-up">
            <h3 style="color: var(--gold); font-size: 2.2rem; margin-bottom: 1.5rem; font-family: var(--disney-font);">The Founders Reward</h3>
            <p>Minting Genesis isn't just buying an AI. The Genesis collection is the <strong>only revenue-participating collection KR8TIV will ever create.</strong></p>
            <p style="margin-top: 1rem;"><strong>5% of company growth</strong> is distributed proportionally among the 50 Genesis holders forever. Future collections will exist, but they will just be standard collectibles. Genesis is Genesis.</p>
        </div>
        <div class="gs-fade-up">
            <h3 style="color: var(--cyan); font-size: 2.2rem; margin-bottom: 1.5rem; font-family: var(--disney-font);">Gamified Utility Traits</h3>
            <p>Your Genesis KIN features randomized utility traits. You might mint a <em>Bard</em> (Free voice clone), an <em>Oracle</em> (Early model access), or a <em>Merchant</em> (Crypto wallet management included).</p>
            <p style="margin-top: 1rem;">Find one of the 5 Mythics to unlock every single ability and unique 1/1 art.</p>
        </div>
    </div>
</section>

<section id="pricing">
    <h2 class="section-header split-text">Your Private OpenClaw</h2>
    <p class="intro-text gs-fade-up">After your free Genesis months end, we maintain your KIN. We handle the VPS hosting, API bills, and 24/7 uptime. You just talk to your friend.</p>
    <div class="grid-3">
        <div class="ticket-card gs-tilt gs-stagger">
            <h3>Hatchling Hosting</h3>
            <div class="price">$89<span>/mo</span></div>
            <ul class="features">
                <li>Grok-3 or Claude 3.5 Sonnet</li>
                <li>80 GB Context Memory</li>
                <li>Telegram + WhatsApp Access</li>
                <li>Voice + Standard Computer Control</li>
            </ul>
        </div>
        <div class="ticket-card elite gs-tilt gs-stagger">
            <h3 style="color: var(--cyan);">Elder Hosting</h3>
            <div class="price">$169<span>/mo</span></div>
            <ul class="features">
                <li>Claude Sonnet 4.5 + Advanced Tools</li>
                <li>Unlimited Context Memory</li>
                <li>High-Level Workflow Automation</li>
                <li>Direct Priority Support</li>
            </ul>
        </div>
        <div class="ticket-card premium gs-tilt gs-stagger">
            <h3 style="color: var(--magenta);">Hero Hosting</h3>
            <div class="price">$299<span>/mo</span></div>
            <ul class="features">
                <li>Ensemble Models (Best-in-class)</li>
                <li>Maximum Automation & API hooks</li>
                <li>Dedicated Account Manager</li>
                <li>Custom Voice Clone</li>
            </ul>
        </div>
    </div>
    <p style="text-align: center; margin-top: 4rem; font-size: 0.95rem; color: var(--text-muted);" class="gs-fade-up">
        *Genesis holders apply their lifetime discount (25% - 50%) to these prices.<br>
        *Secondary Market: Genesis KIN owners can trade their companion. A one-time $149 rebinding fee applies to new owners for secure data reloading.
    </p>
</section>

<section>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4rem; max-width: 1400px; margin: 0 auto;">
        <div class="gs-fade-up">
            <h2 style="font-size: clamp(3rem, 5vw, 4.5rem); margin-bottom: 2rem; color: var(--magenta); font-family: var(--disney-font); line-height: 1;">Give the Future.</h2>
            <p style="margin-bottom: 1.5rem;">Know someone who's not technical? Your parents, your partner, your boss?</p>
            <p style="margin-bottom: 3rem;">Because we handle literally everything, KIN makes the perfect gift. We will personally onboard them, learn their preferences, and hand them a magical AI companion that just works.</p>
            <a href="#mint" class="cta-magnetic cta-primary">Gift a KIN</a>
        </div>
        <div class="gs-fade-up">
            <h2 style="font-size: clamp(3rem, 5vw, 4.5rem); margin-bottom: 2rem; color: var(--cyan); font-family: var(--disney-font); line-height: 1;">The Roadmap</h2>
            <ul class="features">
                <li><strong>Q3:</strong> Fully animated companion app interfaces</li>
                <li><strong>Q4:</strong> Physical plush toys with embedded contextual memory USBs</li>
                <li><strong>2027:</strong> Blockchain-secured identity hashing (indestructible companions)</li>
                <li><strong>2027:</strong> Enterprise digital employees for medical, legal, and architecture</li>
            </ul>
        </div>
    </div>
</section>

<footer>
    <div style="margin-bottom: 3rem; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h2 style="font-family: var(--disney-font); font-size: 3rem; color: var(--gold); letter-spacing: -0.05em;">KIN</h2>
        <p style="font-size: 1rem; margin-top: 0.5rem; letter-spacing: 0.1em; text-transform: uppercase;">by KR8TIV AI</p>
    </div>
    <div class="footer-links">
        <a class="cta-magnetic" href="#">Twitter (X)</a>
        <a class="cta-magnetic" href="#">Discord</a>
        <a class="cta-magnetic" href="#">Waitlist</a>
        <a class="cta-magnetic" href="#">Terms</a>
    </div>
    <p style="margin-top: 4rem; font-size: 0.9rem; opacity: 0.5;">© 2026 KR8TIV AI. All rights reserved.</p>
</footer>

<script>
    /* CUSTOM CURSOR & MAGNETIC BUTTONS */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mX = 0, mY = 0;

    if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) {
        document.addEventListener('mousemove', (e) => {
            mX = e.clientX; mY = e.clientY;
            gsap.to(cursorDot, { x: mX, y: mY, duration: 0.1, ease: 'power2.out' });
            gsap.to(cursorRing, { x: mX, y: mY, duration: 0.3, ease: 'power2.out' });
        });

        document.querySelectorAll('.cta-magnetic').forEach(btn => {
            btn.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            btn.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
                gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
            });
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
            });
        });
    } else {
        cursorDot.style.display = 'none';
        cursorRing.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    /* DARK/LIGHT MODE */
    function toggleMode() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        document.getElementById('mode-label').textContent = isLight ? 'LIGHT' : 'DARK';
        document.getElementById('mode-label').style.color = isLight ? '#000' : '#FFF';
    }

    /* CANVAS PARTICLES (HERO AURORA) */
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    for(let i=0; i<100; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 3 + 1,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 170, 0.3)'
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            if(p.x < 0 || p.x > w) p.dx *= -1;
            if(p.y < 0 || p.y > h) p.dy *= -1;

            // Connect to mouse gently
            let dx = mX - p.x;
            let dy = mY - p.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 200) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mX, mY);
                ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist/200)})`;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    /* LENIS SETUP */
    const lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    /* GSAP & SCROLLTRIGGER SETUP */
    gsap.registerPlugin(ScrollTrigger);

    /* SPLIT TEXT HELPER */
    document.querySelectorAll('.split-text').forEach(el => {
        let text = el.innerText;
        el.innerHTML = text.split(' ').map(word => {
            let chars = word.split('').map(char => `<span class="split-text-char">${char}</span>`).join('');
            return `<div class="split-text-wrap">${chars}</div>`;
        }).join('&nbsp;');
    });

    /* ANIMATIONS */
    // Split text reveal
    gsap.utils.toArray('.split-text').forEach(title => {
        gsap.to(title.querySelectorAll('.split-text-char'), {
            scrollTrigger: { trigger: title, start: "top 85%", toggleActions: "play none none reverse" },
            y: "0%", opacity: 1, duration: 1, ease: "power4.out", stagger: 0.02
        });
    });

    // Fade ups
    gsap.utils.toArray('.gs-fade-up').forEach(elem => {
        gsap.fromTo(elem, { y: 60, opacity: 0 }, {
            scrollTrigger: { trigger: elem, start: "top 85%", toggleActions: "play none none reverse" },
            y: 0, opacity: 1, duration: 1.2, ease: "power3.out"
        });
    });

    // Staggers within containers
    gsap.utils.toArray('.grid-3, .grid-5, tbody').forEach(grid => {
        const items = grid.querySelectorAll('.gs-stagger, .gs-stagger-row');
        if(items.length > 0) {
            gsap.fromTo(items, { y: 60, opacity: 0 }, {
                scrollTrigger: { trigger: grid, start: "top 85%", toggleActions: "play none none reverse" },
                y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out"
            });
        }
    });

    // 3D Tilt Hover
    if (!('ontouchstart' in window)) {
        document.querySelectorAll('.gs-tilt').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((centerX - x) / centerX) * -8;
                gsap.to(card.querySelector('img, .card-content') || card, {
                    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                    duration: 0.4, ease: 'power2.out'
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card.querySelector('img, .card-content') || card, {
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                    duration: 0.7, ease: 'power2.out'
                });
            });
        });
    }

    // Horizontal Scroll for Genesis Bloodlines
    const genesisWrap = document.querySelector('.genesis-track');
    const bloodlineSection = document.querySelector('.bloodlines-section');
    if (genesisWrap && bloodlineSection && window.innerWidth > 1024) {
        gsap.to(genesisWrap, {
            x: () => -(genesisWrap.scrollWidth - window.innerWidth + 100),
            ease: "none",
            scrollTrigger: {
                trigger: bloodlineSection,
                pin: true,
                scrub: 1,
                end: () => "+=" + genesisWrap.scrollWidth
            }
        });
    }

</script>
</body>
</html>
"""

new_content = head_and_scripts + body_content

with open('c:/Users/lucid/Desktop/kin-by-kr8tiv/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("HTML modified successfully.")
