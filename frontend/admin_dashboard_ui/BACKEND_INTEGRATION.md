# Backend Integration Guide

This document outlines the integration between the frontend and the new backend API.

## Backend API Structure

### Base URL
- Backend runs on: `http://localhost:8000`
- API base URL: `http://localhost:8000/api`

### Authentication Endpoints
- `POST /api/auth/setup` - Create admin user for testing
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Management Endpoints (Admin Only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/{user_id}` - Update user role
- `DELETE /api/users/{user_id}` - Delete user

### User Profile Endpoints
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update current user profile
- `DELETE /api/me` - Delete current user profile

## Frontend Changes Made

### 1. Updated AuthService (`src/services/authService.ts`)
- Fixed `/auth/me` endpoint to use `/me` (correct backend path)
- Maintained proper token handling with `access_token` field
- Added proper error handling for network issues

### 2. UserService (`src/services/userService.ts`)
- All endpoints properly configured for the backend
- Role updates use the correct PUT endpoint
- Proper error handling and logging

### 3. User Types (`src/types/user.ts`)
- Maintained compatibility with both snake_case and camelCase field names
- Helper function `getUserField()` handles field name variations
- Proper TypeScript interfaces for all data structures

### 4. Authentication Context (`src/context/AuthContext.tsx`)
- Proper token storage and retrieval
- Automatic user session restoration
- Clean logout functionality

## Backend Requirements

### Database Setup
The backend requires a PostgreSQL database with the following setup:

1. **Environment Variables** (see `backend/env_template.txt`):
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEBUG=True
   CORS_ORIGINS=["http://localhost:5173"]
   ```

2. **Database Migration**:
   ```bash
   cd backend
   alembic upgrade head
   ```

### Backend Startup
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Startup
```bash
cd frontend
npm install
npm run dev
```

## Testing the Integration

### 1. Backend Health Check
```bash
curl http://localhost:8000/health
```

### 2. Setup Admin User
```bash
curl -X POST http://localhost:8000/api/auth/setup
```

### 3. Login Test
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123*"}'
```

## Key Features

### 1. Role-Based Access Control
- Admin users can access user management
- Regular users are restricted from admin functions
- Proper permission checking on both frontend and backend

### 2. User Management
- Create, read, update, delete users (admin only)
- Role toggling between admin and user
- Search and filter functionality
- Real-time updates

### 3. Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure logout
- Session persistence

### 4. Password Security
- Strong password requirements (8+ chars, uppercase, lowercase, number, special char)
- Password hashing on backend
- Password validation on frontend

## Error Handling

### Frontend Error Handling
- Network connection errors
- Authentication errors
- Permission denied errors
- Validation errors

### Backend Error Handling
- HTTP status codes
- Detailed error messages
- Proper exception handling
- Database transaction rollback

## Security Features

### Backend Security
- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation with Pydantic
- SQL injection protection

### Frontend Security
- Token storage in localStorage
- Automatic token cleanup on logout
- Input sanitization
- XSS protection

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS_ORIGINS includes frontend URL
   - Check that frontend is running on correct port

2. **Database Connection**
   - Verify DATABASE_URL in environment
   - Ensure PostgreSQL is running
   - Run database migrations

3. **Authentication Issues**
   - Check token expiration
   - Verify SECRET_KEY is set
   - Ensure proper JWT algorithm

4. **Frontend Build Issues**
   - Clear node_modules and reinstall
   - Check TypeScript compilation
   - Verify all dependencies

### Debug Mode
Enable debug mode in backend for detailed error messages:
```
DEBUG=True
```

## API Response Format

### Success Response
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true,
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T00:00:00Z"
  }
}
```

### Error Response
```json
{
  "detail": "Error message here"
}
```

## Development Workflow

1. Start backend server
2. Start frontend development server
3. Test authentication flow
4. Test user management features
5. Verify role-based access control
6. Test error handling scenarios

## Production Considerations

1. **Environment Variables**
   - Use strong SECRET_KEY
   - Configure proper CORS_ORIGINS
   - Set DEBUG=False

2. **Database**
   - Use production PostgreSQL instance
   - Configure connection pooling
   - Set up proper backups

3. **Security**
   - Enable HTTPS
   - Configure proper CORS
   - Implement rate limiting
   - Add request validation

4. **Monitoring**
   - Add logging
   - Monitor API performance
   - Track error rates
   - Set up alerts 