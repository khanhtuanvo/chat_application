#!/usr/bin/env python3
"""
Test script to verify last login functionality
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def test_last_login():
    print("Testing Last Login Functionality")
    print("=" * 40)
    
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
            user = login_result['user']
            print(f"✅ Login successful")
            print(f"   Last login: {user.get('last_login_at', 'Not set')}")
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return
    
    # 3. Get current user profile
    print("\n3. Getting current user profile...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            user_profile = response.json()
            print(f"✅ Profile retrieved")
            print(f"   Last login: {user_profile.get('last_login_at', 'Not set')}")
            
            # Check if last_login_at was updated
            if user_profile.get('last_login_at'):
                print("✅ Last login time was updated successfully!")
            else:
                print("❌ Last login time was not updated")
        else:
            print(f"❌ Failed to get profile: {response.text}")
    except Exception as e:
        print(f"❌ Error getting profile: {e}")
    
    # 4. Login again to test multiple updates
    print("\n4. Logging in again to test multiple updates...")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            login_result = response.json()
            user = login_result['user']
            print(f"✅ Second login successful")
            print(f"   Last login: {user.get('last_login_at', 'Not set')}")
        else:
            print(f"❌ Second login failed: {response.text}")
    except Exception as e:
        print(f"❌ Error during second login: {e}")
    
    print("\n" + "=" * 40)
    print("Test completed!")

if __name__ == "__main__":
    test_last_login() 