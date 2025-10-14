#!/usr/bin/env python3
"""
Test script to verify UserResponse serialization
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.schemas.user import UserResponse
from app.models.user import User, UserRole
from datetime import datetime, timezone

def test_user_serialization():
    print("Testing UserResponse serialization...")
    
    # Create a mock user object
    user = User(
        id=1,
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password",
        is_active=True,
        is_verified=True,
        role=UserRole.ADMIN,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        last_login_at=datetime.now(timezone.utc)
    )
    
    # Serialize to UserResponse
    user_response = UserResponse.model_validate(user)
    
    # Convert to dict to see the field names
    user_dict = user_response.model_dump()
    
    print("Serialized user fields:")
    for key, value in user_dict.items():
        print(f"  {key}: {value}")
    
    # Check if camelCase fields are present
    expected_fields = ['id', 'username', 'email', 'isActive', 'isVerified', 'role', 'createdAt', 'updatedAt', 'lastLoginAt']
    missing_fields = [field for field in expected_fields if field not in user_dict]
    
    if missing_fields:
        print(f"❌ Missing fields: {missing_fields}")
        return False
    else:
        print("✅ All expected camelCase fields are present!")
        return True

if __name__ == "__main__":
    test_user_serialization() 