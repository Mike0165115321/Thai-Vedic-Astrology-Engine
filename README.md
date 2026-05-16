# Thai Vedic Astrology Engine (Aetox Astro)

A professional-grade Thai Vedic Astrology engine built with a modern full-stack architecture. This system provides astronomical precision using Swiss Ephemeris and offers a rich, interactive visualization of celestial positions, divisional charts, and life timelines.

![Aetox Astro Dashboard](docs/assets/dashboard_preview.png) *(Preview placeholder)*

## 🌟 Key Features

- **Astronomical Precision**: Powered by `pyswisseph` (Swiss Ephemeris) for high-accuracy planetary positions (Layer 1A).
- **Thai-Vedic Integration**: Supports custom Ayanamsa, localized Thai Nakshatra classification, and the traditional Thai zodiac system.
- **Divisional Charts (Varga)**: Real-time calculation and visualization of D1 (Rasi), D3 (Drekkana), and D9 (Navamsa) charts with full data parity (House Lords, Yogas, Aspects).
- **Advanced Synastry (Comparison)**:
    - **Adaptive Triple-Layer View**: Simultaneously visualize Person A, Person B, and Real-time Transits in a single zodiac wheel without overlaps.
    - **Side-by-Side Analysis**: Compare planetary positions and dignities of two people in a dual-column layout.
    - **Dual Dasha Timelines**: Stacked Vimshottari timelines for direct life-period comparison.
    - **Comparison Aspect Matrix**: Cross-chart aspect detection between two natal charts.
- **Dynamic Transit System**:
    - Real-time transit tracking with an interactive **Age Scrubber** (0-120 years).
    - **Adaptive Dynamic Layout**: The UI automatically expands from a compact 560px single-view to a 650px triple-view when entering Synastry mode.
- **Vimshottari Dasha**: Comprehensive dasha timeline (Mahadasha to Pratyantardasha) with active period highlighting.
- **Aspect Analysis**: Automated detection of conjunctions, oppositions, trines, squares, and sextiles with visual markers.
- **AI-Ready Architecture**: Structured data output designed for integration with LLMs for astrological interpretation.

## 🛠 Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework.
- **Swiss Ephemeris (pyswisseph)**: The gold standard for astronomical calculations.
- **SQLite + SQLAlchemy**: Persistent storage for birth history and chart data.
- **Pytest**: Comprehensive test suite for calculation integrity.

### Frontend
- **Next.js 15 (App Router)**: Modern React framework.
- **Framer Motion**: Smooth, spring-based animations for planetary movements.
- **Tailwind CSS 4**: Next-generation utility-first styling.
- **Lucide React**: Premium iconography.

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 20+

### Quick Start (Unified)
The easiest way to start both the backend and frontend is using the root `start.bat`:

1.  Clone the repository.
2.  Run `setup.bat` (if first time) to install dependencies and set up the Python virtual environment.
3.  Double-click `start.bat`.

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn api.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Desktop App Build (Windows)
The project can be packaged into a standalone `.exe` using Electron and PyInstaller.
```bash
.\build-desktop.bat
```
This will generate the installer in `electron/dist/`.

## 📂 Project Structure

- `backend/`: Python API and Calculation Engine.
- `frontend/`: Next.js Web Interface.
- `electron/`: Electron wrapper for the standalone desktop application.
- `docs/`: Technical documentation and build orders.
- `temp_geography/`: Local database for high-precision coordinate search.

## 🗺 Roadmap
- [x] Layer 1A-1G: Core Astronomical Engine, Dasha & Initial UI.
- [x] Layer 2A: Advanced Synastry & Dual Timelines.
- [x] Layer 2B: Aspect Analysis & Cross-Chart Matrix.
- [x] Layer 2C: House Lord Mapping, Yoga Engine & Triple Chart Visualization.
- [ ] Layer 3: Shadbala, Strength Systems & Astro Score.
- [ ] Layer 4: AI Interpretation & Narrative Engine.

## 📄 License
This project is proprietary and built for the Aetox Astrology system.
