import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
PROFILE_URL = f"{BASE_URL}/api/me"
UPDATE_PROFILE_URL = f"{BASE_URL}/api/me"

def test_user_profile():
    """Test the user profile endpoints"""
    
    # Test data
    login_data = {
        "email": "admin@example.com",
        "password": "admin123*"
    }
    
    update_data = {
        "username": "admin_updated",
        "email": "admin@example.com"
    }
    
    try:
        # Step 1: Login to get token
        print("1. Logging in...")
        login_response = requests.post(LOGIN_URL, json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"Login failed: {login_response.text}")
            return
        
        token_data = login_response.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        print(f"Token received: {token[:20]}...")
        
        # Step 2: Get current user profile
        print("\n2. Getting current user profile...")
        profile_response = requests.get(PROFILE_URL, headers=headers)
        print(f"Get profile status: {profile_response.status_code}")
        if profile_response.status_code == 200:
            profile_data = profile_response.json()
            print(f"Profile data: {json.dumps(profile_data, indent=2)}")
        else:
            print(f"Get profile failed: {profile_response.text}")
        
        # Step 3: Update user profile
        print("\n3. Updating user profile...")
        update_response = requests.put(UPDATE_PROFILE_URL, headers=headers, json=update_data)
        print(f"Update profile status: {update_response.status_code}")
        if update_response.status_code == 200:
            update_data_response = update_response.json()
            print(f"Update response: {json.dumps(update_data_response, indent=2)}")
        else:
            print(f"Update failed: {update_response.text}")
        
        # Step 4: Get updated user profile
        print("\n4. Getting updated user profile...")
        updated_profile_response = requests.get(PROFILE_URL, headers=headers)
        print(f"Get updated profile status: {updated_profile_response.status_code}")
        if updated_profile_response.status_code == 200:
            updated_profile_data = updated_profile_response.json()
            print(f"Updated profile data: {json.dumps(updated_profile_data, indent=2)}")
        else:
            print(f"Get updated profile failed: {updated_profile_response.text}")
        
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    test_user_profile() 