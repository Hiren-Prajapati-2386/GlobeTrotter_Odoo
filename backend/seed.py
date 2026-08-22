from app.database import SessionLocal
from app.models import *  # Import all models to resolve SQLAlchemy relationships
from app.models.city import City
from app.models.activity import Activity

def seed_data():
    db = SessionLocal()
    try:
        # Check if database already has cities to avoid duplicates
        if db.query(City).count() > 0:
            print("Database is already seeded!")
            return

        print("🌍 Seeding Cities...")
        paris = City(name="Paris", country="France", cost_index=85.50, popularity_score=100, image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34")
        tokyo = City(name="Tokyo", country="Japan", cost_index=90.00, popularity_score=98, image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf")
        rome = City(name="Rome", country="Italy", cost_index=75.00, popularity_score=95, image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5")
        
        db.add_all([paris, tokyo, rome])
        db.commit()
        
        # Refresh to get the auto-generated IDs
        db.refresh(paris)
        db.refresh(tokyo)
        db.refresh(rome)

        print("🎢 Seeding Activities...")
        activities = [
            Activity(city_id=paris.id, name="Eiffel Tower Tour", category="Sightseeing", cost=30.00, duration_minutes=120),
            Activity(city_id=paris.id, name="Louvre Museum", category="Culture", cost=20.00, duration_minutes=180),
            Activity(city_id=tokyo.id, name="Sushi Making Class", category="Food", cost=85.00, duration_minutes=150),
            Activity(city_id=tokyo.id, name="Mt. Fuji Day Trip", category="Adventure", cost=120.00, duration_minutes=600),
            Activity(city_id=rome.id, name="Colosseum Underground", category="History", cost=45.00, duration_minutes=90),
            Activity(city_id=rome.id, name="Pasta & Tiramisu Class", category="Food", cost=65.00, duration_minutes=180),
        ]
        
        db.add_all(activities)
        db.commit()

        print("✅ Seeding complete! Your demo data is ready.")
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()