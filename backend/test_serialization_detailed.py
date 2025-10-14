#!/usr/bin/env python3
"""
Detailed test script to debug serialization issue
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.schemas.user import UserResponse
from app.models.user import User, UserRole
from app.database import get_db
from datetime import datetime, timezone

def test_serialization_detailed():
    print("Testing detailed UserResponse serialization...")
    
    db = next(get_db())
    
    try:
        # Get a real user from database
        user = db.query(User).first()
        if not user:
            print("No users found in database")
            return
            
        print(f"Database user:")
        print(f"  ID: {user.id}")
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  is_active: {user.is_active} (type: {type(user.is_active)})")
        print(f"  is_verified: {user.is_verified} (type: {type(user.is_verified)})")
        print(f"  role: {user.role}")
        print(f"  created_at: {user.created_at}")
        print(f"  updated_at: {user.updated_at}")
        print(f"  last_login_at: {user.last_login_at}")
        print()
        
        # Try to serialize
        print("Attempting to serialize...")
        try:
            user_response = UserResponse.model_validate(user)
            print("✅ Serialization successful!")
            
            # Convert to dict
            user_dict = user_response.model_dump()
            print("Serialized fields:")
            for key, value in user_dict.items():
                print(f"  {key}: {value} (type: {type(value)})")
                
        except Exception as e:
            print(f"❌ Serialization failed: {e}")
            import traceback
            traceback.print_exc()
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_serialization_detailed() 