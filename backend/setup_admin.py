#!/usr/bin/env python3
"""
Script to create an admin user for testing purposes.
Run this script after setting up the database with Alembic.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.services.auth_service import auth_service
from app.database import create_tables

def create_admin_user():
    """Create an admin user for testing"""
    
    # Create tables if they don't exist
    create_tables()
    
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        
        if admin_user:
            print("Admin user already exists!")
            print(f"Email: {admin_user.email}")
            print(f"Username: {admin_user.username}")
            print(f"Role: {admin_user.role}")
            return
        
        # Create admin user
        admin_user = User(
            email="admin@example.com",
            username="admin",
            hashed_password=auth_service.hash_password("admin123"),
            is_active=True,
            is_verified=True,
            role=UserRole.ADMIN
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"Email: {admin_user.email}")
        print(f"Username: {admin_user.username}")
        print(f"Password: admin123")
        print(f"Role: {admin_user.role}")
        print("\nYou can now use these credentials to test your endpoints.")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

def create_test_user():
    """Create a regular user for testing"""
    
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        test_user = db.query(User).filter(User.email == "user@example.com").first()
        
        if test_user:
            print("Test user already exists!")
            print(f"Email: {test_user.email}")
            print(f"Username: {test_user.username}")
            print(f"Role: {test_user.role}")
            return
        
        # Create test user
        test_user = User(
            email="user@example.com",
            username="testuser",
            hashed_password=auth_service.hash_password("user123"),
            is_active=True,
            is_verified=True,
            role=UserRole.USER
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("✅ Test user created successfully!")
        print(f"Email: {test_user.email}")
        print(f"Username: {test_user.username}")
        print(f"Password: user123")
        print(f"Role: {test_user.role}")
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Setting up test users...")
    print("=" * 50)
    
    create_admin_user()
    print()
    create_test_user()
    
    print("\n" + "=" * 50)
    print("✅ Setup complete!")
    print("\nYou can now test your endpoints with:")
    print("Admin: admin@example.com / admin123")
    print("User: user@example.com / user123") 