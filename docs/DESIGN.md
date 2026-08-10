# Design — Implementation Plan

Goal: Upgrade the Mos homepage to "Precision Instrument" aesthetic — upgraded material quality, asymmetric bento grid, Framer Motion spring entrance/3D-hover, split Hero layout.

Architecture: Pure monochrome stays; quality comes from layered glass materials, diffusion shadows, and spring physics. Framer Motion replaces CSS reveal animations; CSS canvas/orb animations stay. A new BentoCard wraps all feature cards with 3D hover. A new HeroCurvePanel adds a right-column visual to the Hero.

Tech Stack: Next.js 16, React 19, Tailwind CSS v3, Framer Motion v11, TypeScript, React Flow,
Icons: use Phosphor icons
font: Excalifont family

- A comprehensive aesthetic upgrade of the Mos homepage. Constraints: Pure monochrome (no color accents), add Framer Motion, keep all existing functionality

Section 2 — Typography System
Element Before After
Hero H1 (mobile) 42px 52px
Hero H1 (tablet) 72px 88px
Hero H1 (desktop) 84px 108px
Hero H1 (large) – 124px
H1 tracking default tracking-[-0.02em]
H1 line-height – leading-[0.95]
Kicker tracking 0.18em 0.22em
Kicker color white/70 white/50
Body line-height leading-relaxed leading-[1.7]
Mono numerals – tabular-nums

font - Excalifont

Section 5 — Framer Motion Animation System
New dependency: framer-motion (~70KB gz)

Spring baseline
const spring = { type: "spring", stiffness: 100, damping: 20 }
Reveal component (upgraded)
Replace CSS .reveal/.in-view with motion.div + useInView from FM
Keep same Reveal component API (delayMs, className props)
Remove .reveal, .reveal.in-view from globals.css
Card 3D hover
onMouseMove → compute (rotateX: ±4deg, rotateY: ±6deg) from cursor offset
→ motion.div style={{ rotateX, rotateY, transition: "0.1s ease" }}
→ internal radial-gradient spotlight follows cursor
Bento card stagger
Trigger: useInView with { once: true, margin: "-80px" }
Each card: y: 28 → 0, opacity: 0 → 1, stagger interval 120ms
Items NOT migrated to Framer Motion
FlowField canvas (keeps RAF)
.orb floats (keep CSS float-slow keyframes)
homebrew-pulse / homebrew-sheen (keep CSS keyframes)
hero-in CSS (replaced by FM), stroke-in (keep for SVG path)
Section 4 — Bento Grid Asymmetric Layout
Before
Row 1: [col-span-12: Easing]
Row 2: [col-span-6: Axes] [col-span-6: Per-App]
Row 3: [col-span-12: Buttons]
After (md+)
Row 1: [col-span-7: Easing Playground] [col-span-5: Axes Control] equal height
Row 2: [col-span-5: Per-App Grid] [col-span-7: Button Bindings] ~60px taller than row 1
Pattern: 7+5 ↔ 5+7 alternating columns, row 2 has greater min-height.

Card internal upgrades
Easing card (7/12): Graph area taller, sliders wider
Axes card (5/12): Toggle rows with backdrop-blur grouping box; active toggle has subtle glow
Per-App card (5/12): 2×3 grid (was 3×2), 48px icons, small smooth status badge
Buttons card (7/12): Left-key/right-value alignment; one pulsing placeholder row ("recording...")
