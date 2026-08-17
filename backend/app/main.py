from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import auth, vehicles, service_types, mechanics, service_requests, invoices, history

app = FastAPI(title="VSMS API", description="Vehicle Service Management System API", redirect_slashes=False)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(service_types.router)
app.include_router(mechanics.router)
app.include_router(service_requests.router)
app.include_router(invoices.router)
app.include_router(history.router)

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
