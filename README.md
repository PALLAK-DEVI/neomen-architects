# NEOMEN Architects — Premium Architecture & Interior Design Website

An ultra-luxury web application inspired by [Neomen Studio](https://www.neomen.in/).

**Live Website**: [https://pallak-devi.github.io/neomen-architects/](https://pallak-devi.github.io/neomen-architects/)

## Architecture: Two-Layer Experience

### Layer 1: 3D Scroll-Animated Architectural Landing Page
- **Procedural 3D Villa Solstice**: Built with Three.js, matching the contemporary luxury residence reference storyboard (cantilevered concrete volumes, flat overlapping roof slabs, double-height glass curtain walls, warm teakwood louvers, visible floating staircase, and furnished interiors).
- **Scroll-Controlled 3D Exploded Cutaway Animation**:
  - **Stage 1 (0% - 15%)**: Fully assembled residence.
  - **Stage 2 (15% - 35%)**: Cantilevered roof slabs & rooftop skylight canopy lift vertically.
  - **Stage 3 (35% - 55%)**: Left and right cantilevered bedroom wings and vertical wall panels translate horizontally outward.
  - **Stage 4 (55% - 80%)**: Floor slabs separate vertically, revealing double-height living room, floating teak stairs, and open kitchen island.
  - **Stage 5 (80% - 100%)**: Complete architectural cutaway reveal showcasing subterranean twin coupe garage, private library, living salon, and master suite in engineered alignment.
- **Continuous Bidirectional Scroll & Reverse Interaction**: Smoothly reassembles into the intact house when scrolling up.
- **Navigation Controls**:
  - **VIEW MORE Button (Top-Left)**: Instantly navigates to the main existing website.
  - **Home Icon (Top-Left)**: Smoothly resets the 3D model to its fully assembled state and returns scroll to the top.
  - **Reference Storyboard Modal (Top-Right)**: View the 8-stage architectural design sequence blueprint images.
  - **Interactive 3D Pins**: Dynamic labels highlighting roof, suites, living room, and subterranean garage during explosion.

### Layer 2: Main Studio Website (100% Preserved)
- **Cinematic Hero Slider (6 Architectural Slides)**: Full-bleed showcase featuring curated photography from Unsplash, smooth 700ms cross-fading, dark glassmorphic Previous/Next chevrons, indicator dock, and 6-second auto-rotation with manual override.
- **3D Villa Return Link**: Elegant link in navbar (`3D Villa`) and mobile menu to return to the 3D landing page at any time.
- **Key Stats Dashboard**: Statistics bar highlighting completed projects, global studios, and architectural awards.
- **Filterable Selected Portfolio**: Grid with category filters and interactive project detail modal popups.
- **Interactive Material Atelier**: Real-time texture and finishes preview selector (*Travertine*, *Brass*, *White Oak*, *Concrete*).
- **Project Investment Estimator**: Dynamic area slider and finish tier calculator in Indian Rupees (Cr).
- **Editorial Journal**: Architectural design philosophy articles and trend insights.
- **Bespoke Consultation Portal**: Responsive booking form with studio addresses across New Delhi, Mumbai, Bengaluru, and Dubai.

## File Structure

- `index.html`: Complete single-page application orchestrating Layer 1 (3D Landing Page) and Layer 2 (Main Studio Website).
- `js/villa-3d.js`: Three.js 3D architectural engine, procedural geometry, PBR materials, lighting, and scroll-driven explosion animation.
- `assets/`: Architectural reference storyboards (`storyboard_1.jpg` to `storyboard_4.jpg`).
- `README.md`: Project summary, architecture, live deployment URL, and setup instructions.

## Usage

Simply open `index.html` in any modern web browser with WebGL enabled, or view the live deployment at [https://pallak-devi.github.io/neomen-architects/](https://pallak-devi.github.io/neomen-architects/).
