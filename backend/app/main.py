from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, trips, stops, cities, activities, budget, shared, admin, users

app = FastAPI(title="GlobeTrotter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Default Vite port
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Register the auth routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(trips.router)
app.include_router(stops.router)
app.include_router(cities.router)
app.include_router(activities.router)
app.include_router(budget.router)
app.include_router(shared.router)
app.include_router(admin.router)
app.include_router(users.router)
