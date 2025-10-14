#!/usr/bin/env python3
"""
Test script to check the actual API endpoint response
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api_users():
    print("Testing API /users endpoint...")
    
    # 1. Setup admin user
    print("1. Setting up admin user...")
    try:
        response = requests.post(f"{BASE_URL}/auth/setup")
        if response.status_code == 200:
            admin_user = response.json()
            print(f"✅ Admin user created: {admin_user['username']}")
        else:
            print(f"❌ Failed to setup admin: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error setting up admin: {e}")
        return
    
    # 2. Login as admin
    print("\n2. Logging in as admin...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123*"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            login_result = response.json()
            token = login_result['access_token']
            print(f"✅ Login successful")
            print(f"   Admin user data: {json.dumps(login_result['user'], indent=2, default=str)}")
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return
    
    # 3. Get all users
    print("\n3. Getting all users...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/users", headers=headers)
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Users retrieved successfully")
            print(f"   Number of users: {len(users)}")
            for i, user in enumerate(users):
                print(f"   User {i+1}:")
                print(f"     ID: {user.get('id')}")
                print(f"     Username: {user.get('username')}")
                print(f"     Email: {user.get('email')}")
                print(f"     isActive: {user.get('isActive')} (type: {type(user.get('isActive'))})")
                print(f"     isVerified: {user.get('isVerified')}")
                print(f"     Role: {user.get('role')}")
                print(f"     Created: {user.get('createdAt')}")
                print(f"     Last Login: {user.get('lastLoginAt')}")
                print()
        else:
            print(f"❌ Failed to get users: {response.text}")
    except Exception as e:
        print(f"❌ Error getting users: {e}")
    
    print("\n" + "=" * 40)
    print("Test completed!")

if __name__ == "__main__":
    test_api_users() 