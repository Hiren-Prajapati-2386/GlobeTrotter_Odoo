from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_email = "admin@example.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if admin:
            admin.is_admin = True
            db.commit()
            print("Existing admin@example.com updated to be is_admin=True!")
        else:
            new_admin = User(
                name="Admin User",
                email=admin_email,
                password_hash=hash_password("Password123"),
                is_admin=True
            )
            db.add(new_admin)
            db.commit()
            print("New admin@example.com created with password 'Password123' and is_admin=True!")
            
        # Also make other registered users admin just in case
        all_users = db.query(User).all()
        for u in all_users:
            u.is_admin = True
        db.commit()
        print(f"Updated all {len(all_users)} user accounts to is_admin=True!")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
