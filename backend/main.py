from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import logging
from typing import List, Dict, Any
# import redis.asyncio as redis # Using a mock fallback for safety during demo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="VayuRaksha Backend API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy generator matching the frontend logic for 11 steps (0 to 10)
def generate_mock_forecast() -> List[Dict[str, Any]]:
    forecast_array = []
    base_lon = 77.75
    base_lat = 30.05
    for step in range(11):
        offset = step * 0.08
        intense = step > 4
        features = [
            {
                "type": "Feature",
                "properties": {"intensity": 65 if intense else 48, "type": "primary", "step": step},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [base_lon + offset,        base_lat + 0.00],
                        [base_lon + offset + 0.28, base_lat + 0.08],
                        [base_lon + offset + 0.32, base_lat + 0.28],
                        [base_lon + offset + 0.15, base_lat + 0.38],
                        [base_lon + offset - 0.08, base_lat + 0.28],
                        [base_lon + offset - 0.10, base_lat + 0.08],
                        [base_lon + offset,        base_lat + 0.00]
                    ]]
                }
            }
        ]
        
        if step >= 2:
            features.append({
                "type": "Feature",
                "properties": {"intensity": min(45, 22 + step * 5), "type": "secondary", "step": step},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [base_lon + offset - 0.28, base_lat + 0.18],
                        [base_lon + offset - 0.08, base_lat + 0.22],
                        [base_lon + offset - 0.10, base_lat + 0.38],
                        [base_lon + offset - 0.30, base_lat + 0.35],
                        [base_lon + offset - 0.28, base_lat + 0.18]
                    ]]
                }
            })
            
        forecast_array.append({
            "step": step,
            "geojson": {
                "type": "FeatureCollection",
                "features": features
            }
        })
    return forecast_array

# In a real scenario, this would be fetched from Redis:
# async def fetch_from_redis():
#     r = redis.Redis(host='localhost', port=6379, db=0)
#     data = await r.get('storm_forecast')
#     return json.loads(data)

@app.get("/api/forecast")
async def get_forecast():
    """
    Simulates fetching the pre-calculated 0–6 hour storm polygon array from Redis.
    """
    logger.info("Fetching forecast data...")
    # Mocking Redis fetch with pre-generated array
    data = generate_mock_forecast()
    return {"status": "success", "data": data}

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")

manager = ConnectionManager()

@app.websocket("/api/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """
    WebSocket for Live Alerts (Common Alerting Protocol - CAP).
    Simulates PostGIS detecting a storm intersecting with a populated zone.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open and wait for incoming messages if any
            # In a real app, a background task would broadcast CAP alerts based on PostGIS events
            data = await websocket.receive_text()
            logger.info(f"Received from client: {data}")
            
            # Simple simulation: If client sends a step number, we check if an alert should trigger
            try:
                step = int(data)
                # Simulate intersection logic: e.g. at step 4, a major alert triggers
                if step == 4:
                    cap_alert = {
                        "identifier": "VAYU-ALERT-001",
                        "sender": "VayuRaksha Command Center",
                        "sent": "2026-10-02T12:00:00Z",
                        "status": "Actual",
                        "msgType": "Alert",
                        "scope": "Public",
                        "info": {
                            "category": "Met",
                            "event": "Extreme Supercell & Cloudburst Risk",
                            "responseType": "Evacuate",
                            "urgency": "Immediate",
                            "severity": "Extreme",
                            "certainty": "Observed",
                            "headline": "Imminent Cloudburst Risk in Dehradun",
                            "description": "A severe convective cell has intersected the Dehradun district boundary. Radar indicates reflectivity > 60 dBZ and rapidly rising echo tops.",
                            "area": {
                                "areaDesc": "Dehradun and surrounding valleys"
                            }
                        }
                    }
                    await manager.broadcast(json.dumps({"type": "CAP_ALERT", "alert": cap_alert}))
                elif step == 7:
                    cap_alert = {
                        "identifier": "VAYU-ALERT-002",
                        "sender": "VayuRaksha Command Center",
                        "sent": "2026-10-02T12:45:00Z",
                        "status": "Actual",
                        "msgType": "Alert",
                        "scope": "Public",
                        "info": {
                            "category": "Met",
                            "event": "Hailstorm Warning",
                            "responseType": "Shelter",
                            "urgency": "Expected",
                            "severity": "Severe",
                            "certainty": "Likely",
                            "headline": "Large Hail Expected in Rishikesh",
                            "description": "MESH parameters indicate hail exceeding 32mm. Seek shelter immediately.",
                            "area": {
                                "areaDesc": "Rishikesh and upper Ganga valley"
                            }
                        }
                    }
                    await manager.broadcast(json.dumps({"type": "CAP_ALERT", "alert": cap_alert}))
            except ValueError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
