#!/usr/bin/env python3
"""
Simple test to check API response
"""
import requests
import json

def test_simple_api():
    print("Testing simple API response...")
    
    # Setup admin
    response = requests.post("http://localhost:8000/api/auth/setup")
    if response.status_code != 200:
        print("Failed to setup admin")
        return
    
    # Login
    login_response = requests.post("http://localhost:8000/api/auth/login", json={
        "email": "admin@example.com",
        "password": "admin123*"
    })
    
    if login_response.status_code != 200:
        print("Failed to login")
        return
    
    token = login_response.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get users
    users_response = requests.get("http://localhost:8000/api/users", headers=headers)
    
    if users_response.status_code == 200:
        users = users_response.json()
        print("API Response:")
        print(json.dumps(users, indent=2, default=str))
    else:
        print(f"Failed to get users: {users_response.text}")

if __name__ == "__main__":
    test_simple_api() 