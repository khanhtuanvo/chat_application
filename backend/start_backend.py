#!/usr/bin/env python3
"""
Startup script for Day 7 Backend
This script helps initialize the backend and check for common issues
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} is compatible")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import pydantic
        print("✅ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def check_environment():
    """Check environment variables"""
    required_vars = ["DATABASE_URL", "SECRET_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Create a .env file with the required variables")
        return False
    
    print("✅ Environment variables are set")
    return True

def create_env_template():
    """Create .env template if it doesn't exist"""
    env_file = Path(".env")
    if not env_file.exists():
        print("📝 Creating .env template...")
        env_content = """# Database Configuration
DATABASE_URL=postgresql://postgres:Khanh2006*@localhost:5432/user_management

# Security
SECRET_KEY=your-secret-key-here

# OpenAI (optional for basic functionality)
OPENAI_API_KEY=your-openai-api-key-here

# Application Settings
DEBUG=True
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DATABASE_ECHO=False
"""
        with open(".env", "w") as f:
            f.write(env_content)
        print("✅ Created .env template")
        print("⚠️  Please update the .env file with your actual values")
        return False
    return True

def test_imports():
    """Test if the app can be imported"""
    try:
        from app.main import app
        print("✅ App imports successfully")
        return True
    except Exception as e:
        print(f"❌ App import failed: {e}")
        return False

def main():
    """Main startup function"""
    print("🚀 Day 7 Backend Startup Check")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Environment Template", create_env_template),
        ("Environment Variables", check_environment),
        ("App Imports", test_imports),
    ]
    
    passed = 0
    total = len(checks)
    
    for check_name, check_func in checks:
        print(f"\n🔍 {check_name}...")
        if check_func():
            passed += 1
        else:
            print(f"❌ {check_name} failed")
    
    print("\n" + "=" * 50)
    print(f"📊 Startup Check Results: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 All checks passed! You can now start the backend:")
        print("uvicorn app.main:app --reload --port 8000")
        return True
    else:
        print("⚠️  Some checks failed. Please fix the issues above before starting.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 