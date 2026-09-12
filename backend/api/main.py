from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import uuid
from .routes import scan, alerts, health

app = FastAPI(
    title="VectorGuard AI API",
    description="Backend API for VectorGuard AI pipeline",
    version="1.0.0",
    docs_url="/docs"
)

@app.middleware("http")
async def add_request_id_and_process_time(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = str(int(process_time * 1000))
    return response

# CORS middleware to allow requests from the frontend (Member B's work)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow Vercel and Localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(scan.router)
app.include_router(alerts.router)
app.include_router(health.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "VectorGuard AI Backend is running"}

@app.on_event("startup")
async def startup_event():
    # Initialize SQLite DB via alert_logger.py
    from core.alert_logger import init_db
    await init_db()


