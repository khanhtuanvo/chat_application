#!/usr/bin/env python3
"""
Test script to check database user data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.models.user import User

def test_database_users():
    print("Testing database user data...")
    
    db = next(get_db())
    
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users in database:")
        
        for i, user in enumerate(users):
            print(f"  User {i+1}:")
            print(f"    ID: {user.id}")
            print(f"    Username: {user.username}")
            print(f"    Email: {user.email}")
            print(f"    is_active: {user.is_active} (type: {type(user.is_active)})")
            print(f"    is_verified: {user.is_verified} (type: {type(user.is_verified)})")
            print(f"    role: {user.role}")
            print(f"    created_at: {user.created_at}")
            print(f"    updated_at: {user.updated_at}")
            print(f"    last_login_at: {user.last_login_at}")
            print()
            
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_database_users() 