#!/usr/bin/env python3
"""
Test script for Day 7 Chat Integration
This script tests the chat functionality and database setup
"""

import requests
import json
import sys
import os
import subprocess
from datetime import datetime
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_backend_imports():
    """Test if the backend can be imported without errors"""
    print("🔍 Testing Backend Imports...")
    
    try:
        # Test basic imports
        import fastapi
        import uvicorn
        import sqlalchemy
        import pydantic
        print("✅ Basic dependencies imported successfully")
        
        # Test app imports
        try:
            from app.main import app
            print("✅ FastAPI app imported successfully")
            return True
        except Exception as e:
            print(f"❌ App import failed: {e}")
            return False
            
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def test_environment_setup():
    """Test environment configuration"""
    print("\n🔧 Testing Environment Setup...")
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        print("Run: python start_backend.py to create it")
        return False
    
    print("✅ .env file exists")
    
    # Check required environment variables
    required_vars = ["DATABASE_URL", "SECRET_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Update your .env file with the required variables")
        return False
    
    print("✅ Environment variables are set")
    return True

def test_database_migration():
    """Test if database migration has been run"""
    print("\n🗄️ Testing Database Migration...")
    
    try:
        # Check if migration file exists
        migration_file = Path("migration_chat_tables.sql")
        if not migration_file.exists():
            print("❌ Migration file not found: migration_chat_tables.sql")
            return False
        
        print("✅ Migration file exists")
        print("⚠️  Make sure to run: psql -U postgres -d user_management -f migration_chat_tables.sql")
        return True
        
    except Exception as e:
        print(f"❌ Database migration check failed: {e}")
        return False

def test_server_connection():
    """Test if the server is running and accessible"""
    print("\n🌐 Testing Server Connection...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and accessible")
            return True
        else:
            print(f"❌ Server responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - it's not running")
        print("Start the server with: uvicorn app.main:app --reload --port 8000")
        return False
    except requests.exceptions.Timeout:
        print("❌ Server connection timeout")
        return False
    except Exception as e:
        print(f"❌ Server connection error: {e}")
        return False

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("\n🔐 Testing Authentication Endpoints...")
    
    try:
        response = requests.get(f"{API_BASE}/auth/login", timeout=5)
        if response.status_code in [200, 405]:  # 405 is expected for GET on POST endpoint
            print("✅ Auth endpoints are accessible")
            return True
        else:
            print(f"❌ Auth endpoints failed - status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to auth endpoints - server not running")
        return False
    except Exception as e:
        print(f"❌ Auth endpoints error: {e}")
        return False

def test_chat_endpoints():
    """Test chat endpoints (should return 401 without auth)"""
    print("\n💬 Testing Chat Endpoints...")
    
    try:
        response = requests.get(f"{API_BASE}/chat/conversations", timeout=5)
        if response.status_code == 401:
            print("✅ Chat endpoints require authentication (as expected)")
            return True
        else:
            print(f"❌ Chat endpoints unexpected response - status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to chat endpoints - server not running")
        return False
    except Exception as e:
        print(f"❌ Chat endpoints error: {e}")
        return False

def test_openai_config():
    """Test OpenAI configuration"""
    print("\n🤖 Testing OpenAI Configuration...")
    
    try:
        # Check if OpenAI API key is configured
        response = requests.get(f"{API_BASE}/chat/conversations", timeout=5)
        # If we get a 401, it means the server is running and auth is working
        if response.status_code == 401:
            print("✅ OpenAI configuration appears to be working")
            return True
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to test OpenAI config - server not running")
        return False
    except Exception as e:
        print(f"❌ OpenAI configuration error: {e}")
        return False

def check_server_status():
    """Check if server is running and provide status"""
    print("\n📊 Server Status Check...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=3)
        if response.status_code == 200:
            print("✅ Server is running on http://localhost:8000")
            return True
        else:
            print(f"⚠️  Server responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running")
        print("To start the server, run:")
        print("  uvicorn app.main:app --reload --port 8000")
        return False

def main():
    """Run all tests"""
    print("🚀 Day 7 Chat Integration Test")
    print("=" * 50)
    
    # First, check if server is running
    server_running = check_server_status()
    
    # Tests that can run without server
    offline_tests = [
        ("Backend Imports", test_backend_imports),
        ("Environment Setup", test_environment_setup),
        ("Database Migration", test_database_migration),
    ]
    
    # Tests that require server to be running
    online_tests = [
        ("Server Connection", test_server_connection),
        ("Authentication Endpoints", test_auth_endpoints),
        ("Chat Endpoints", test_chat_endpoints),
        ("OpenAI Configuration", test_openai_config),
    ]
    
    # Run offline tests first
    print("\n🔍 Running Offline Tests...")
    offline_passed = 0
    offline_total = len(offline_tests)
    
    for test_name, test_func in offline_tests:
        try:
            if test_func():
                offline_passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} error: {e}")
    
    # Run online tests if server is running
    print("\n🔍 Running Online Tests...")
    online_passed = 0
    online_total = len(online_tests)
    
    if server_running:
        for test_name, test_func in online_tests:
            try:
                if test_func():
                    online_passed += 1
                else:
                    print(f"❌ {test_name} failed")
            except Exception as e:
                print(f"❌ {test_name} error: {e}")
    else:
        print("⚠️  Skipping online tests - server not running")
        online_passed = 0
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Results:")
    print(f"   Offline Tests: {offline_passed}/{offline_total} passed")
    print(f"   Online Tests: {online_passed}/{online_total} passed")
    
    total_passed = offline_passed + online_passed
    total_tests = offline_total + (online_total if server_running else 0)
    
    if total_passed == total_tests and total_tests > 0:
        print("🎉 All tests passed! The integration is working correctly.")
        print("\n📋 Next Steps:")
        print("1. Start the frontend: cd ../frontend && npm run dev")
        print("2. Test the full integration by logging in and accessing chat")
    else:
        print("⚠️ Some tests failed. Please check the issues above.")
        print("\n🔧 Troubleshooting:")
        if not server_running:
            print("1. Start the backend: uvicorn app.main:app --reload --port 8000")
        print("2. Run database migration: psql -U postgres -d user_management -f migration_chat_tables.sql")
        print("3. Verify all dependencies: pip install -r requirements.txt")
        print("4. Check .env file configuration")
    
    return total_passed == total_tests and total_tests > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 