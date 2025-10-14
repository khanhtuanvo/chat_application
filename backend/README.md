# User Management Backend

## Setup Instructions

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create .env file:**
   ```bash
   # Create .env file in backend directory
   SECRET_KEY=your-super-secret-key-change-this-in-production
   DATABASE_URL=sqlite:///./user_management.db
   ```

3. **Run the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the API:**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### User Management (Admin Only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/users/{id}/role` - Change user role

### User Profile
- `GET /api/users/profile` - Get own profile
- `PUT /api/users/profile` - Update own profile 