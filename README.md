# VayuRaksha

## Convective-scale nowcasting for India

VayuRaksha is an enterprise-style severe-weather command center for short-range, 0–6 hour nowcasting. It combines an interactive India map, terrain-aware visualization, forecast timeline controls, threat metrics, CAP alert workflows, and a FastAPI service that simulates forecast delivery and live alert events.

> **Project status:** Demonstration prototype. The forecast and alert data in the included backend are generated mock data intended for product demonstrations and integration testing, not operational emergency use.

## Features

- India-wide MapLibre map with:
  - OpenFreeMap Liberty geographical basemap
  - AWS Terrarium digital elevation terrain
  - India state boundaries and labels
  - Search for Indian cities and districts through OpenStreetMap Nominatim
  - Cinematic camera flight with pitch and terrain
- 0–6 hour forecast horizon with:
  - Play, pause, reset, and step selection
  - Real IST timestamps
  - Live observation, ConvLSTM, blend, and WRF model zones
- Threat monitoring:
  - Reflectivity, echo tops, MESH hail, cloudburst risk, lightning density, and surface temperature
  - Translucent amber, crimson, and purple radar-style storm overlays
  - Scan target marker and threat progression
- Alert operations:
  - CAP alert feed with search and severity filters
  - Extreme/severe/moderate alert states
  - Dashboard CAP toast notifications
  - Manual CAP dispatch simulator in the Command Center
- Operations tooling:
  - Live VayuRaksha system log
  - Kafka, Celery, ConvLSTM, PostGIS, and CAP pipeline simulation messages
  - Service health and personnel status panels
- Settings page for alert, sound, terrain, and forecast playback preferences

## Tech stack

### Frontend

- Next.js 16
- React 19
- MapLibre GL
- `react-map-gl`
- Tailwind CSS 4
- Framer Motion
- Lucide React

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- WebSockets

## Project structure

```text
vayuraksha/
├── backend/
│   ├── main.py                 # Forecast API and CAP WebSocket service
│   └── requirements.txt
├── public/
│   ├── vayuraksha-logo.png
│   ├── maplibre-gl-worker.mjs
│   └── maplibre-gl-shared.mjs
├── src/
│   ├── app/
│   │   ├── admin/              # Command Center
│   │   ├── alerts/             # CAP alert operations
│   │   ├── dashboard/          # Main map dashboard
│   │   ├── settings/           # User preferences
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   └── components/
│       ├── WeatherMap.js
│       ├── ForecastHorizonScrubber.js
│       └── TopNav.js
├── package.json
└── README.md
```

## Requirements

- Node.js 20 or newer
- npm
- Python 3.11 or newer
- Git

## Installation

Clone the repository and install frontend dependencies:

```bash
git clone https://github.com/adityamishra2107/vayuraksha.git
cd vayuraksha
npm install
```

Create and activate a backend virtual environment:

### Windows PowerShell

```powershell
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### macOS/Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

## Run locally

Start the backend in one terminal:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

Start the frontend in a second terminal:

```bash
npm run dev
```

On Windows, if PowerShell blocks the npm script, use:

```powershell
npm.cmd run dev
```

Open the application at [http://localhost:3000](http://localhost:3000).

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | VayuRaksha landing page |
| `/dashboard` | Live map and forecast command dashboard |
| `/alerts` | CAP alert operations and filtering |
| `/settings` | Dashboard preferences |
| `/admin` | Command Center, system health, logs, and CAP simulation |

## Backend API

### Forecast

```http
GET http://localhost:8001/api/forecast
```

Returns an 11-step forecast array containing GeoJSON storm features for the 0–6 hour horizon.

### Live CAP alerts

```text
ws://localhost:8001/api/ws/alerts
```

The frontend sends the active forecast step as text over the WebSocket. The demonstration backend broadcasts:

- Step `4`: extreme cloudburst alert
- Step `7`: severe hailstorm alert

Example test with a WebSocket client:

```python
import asyncio
import websockets

async def main():
    async with websockets.connect("ws://localhost:8001/api/ws/alerts") as socket:
        await socket.send("4")
        print(await socket.recv())

asyncio.run(main())
```

## Validation commands

Run the production build:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Start the production server after building:

```bash
npm run start
```

## Data and external services

The prototype uses the following public services from the browser:

- OpenFreeMap for the Liberty basemap
- AWS Terrain-RGB elevation tiles
- OpenStreetMap Nominatim for India-restricted geocoding
- Datameet India state GeoJSON boundaries

These services may have usage limits and availability constraints. For production deployment, use a managed tile provider, respect each service's terms and rate limits, add request throttling/caching, and configure service URLs through environment variables.

## Production considerations

Before operational use:

1. Replace mock forecast generation with authenticated Kafka/Redis/PostGIS/forecast services.
2. Restrict FastAPI CORS origins instead of allowing all origins.
3. Add authentication and authorization for CAP dispatch and administration.
4. Validate and sign CAP messages before distribution.
5. Add observability, retries, rate limiting, and durable event storage.
6. Use environment variables for backend URLs and external tile/geocoding services.
7. Add automated unit, integration, accessibility, and end-to-end tests.
8. Obtain approval from relevant disaster-management and meteorological authorities before issuing public warnings.

## License

No license has been declared yet. Add a license file before distributing or reusing this project outside its intended repository.

