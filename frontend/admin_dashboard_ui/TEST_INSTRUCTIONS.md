# Frontend Testing Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   - Navigate to http://localhost:3000
   - You'll be redirected to the login page

## Test Credentials

### Admin User
- **Username:** `admin`
- **Email:** `admin@example.com`
- **Password:** `password123`
- **Role:** Admin

### Regular User
- **Username:** `user`
- **Email:** `user@example.com`
- **Password:** `password123`
- **Role:** User

## Testing Scenarios

### 1. Registration
- Go to http://localhost:3000/register
- Try registering with:
  - Username: `testuser`
  - Email: `test@example.com`
  - Password: `password123`
  - Confirm Password: `password123`
- Should redirect to login page after successful registration

### 2. Login
- Go to http://localhost:3000/login
- Try logging in with:
  - Username: `admin` (or `admin@example.com`)
  - Password: `password123`
- Should redirect to dashboard and show user info

### 3. Dashboard
- After login, you'll see the dashboard with:
  - Welcome message with username
  - User information (username, email, role, status)
  - Logout button

### 4. Logout
- Click the "Logout" button
- Should redirect to login page
- Try accessing dashboard again - should redirect to login

### 5. Protected Routes
- Try accessing http://localhost:3000/dashboard without logging in
- Should redirect to login page

## Mock Features

- ✅ User registration with validation
- ✅ User login with username or email
- ✅ JWT token simulation
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Logout functionality
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

## Notes

- This is a mock implementation for frontend testing
- No real backend is required
- All data is stored in localStorage
- API calls are simulated with delays
- Error handling is implemented for testing 