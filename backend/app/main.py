from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth

app = FastAPI(title="GlobeTrotter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Default Vite port
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Register the auth routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])