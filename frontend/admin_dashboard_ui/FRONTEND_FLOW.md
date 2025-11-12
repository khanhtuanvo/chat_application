# Frontend Flow & Architecture

## 🏗️ Application Structure

```
src/
├── components/
│   └── auth/
│       ├── LoginForm.tsx          # Login form component
│       ├── RegisterForm.tsx       # Registration form component
│       ├── ProtectedRoute.tsx     # Route protection component
│       ├── UserCard.tsx           # User display card
│       ├── UserList.tsx           # User list component
│       └── UserModal.tsx          # User creation modal
├── pages/
│   ├── LoginPage.tsx              # Login page wrapper
│   ├── RegisterPage.tsx           # Registration page wrapper
│   ├── DashboardPage.tsx          # Main dashboard
│   ├── UsersPage.tsx              # User management page
│   └── TestPage.tsx               # Test/development page
├── context/
│   └── AuthContext.tsx            # Authentication state management
├── hooks/
│   └── useAuth.ts                 # Authentication hook
├── services/
│   ├── authService.ts             # Authentication API calls
│   └── userService.ts             # User management API calls
├── types/
│   └── user.ts                    # TypeScript type definitions
└── App.tsx                        # Main application component
```

## 🔄 Application Flow

### 1. **Initial Load Flow**
```
App.tsx → AuthProvider → Check localStorage for token → 
If token exists → Get current user → Set user state → 
If no token → Set loading to false → Render routes
```

### 2. **Authentication Flow**
```
LoginPage → LoginForm → useAuth.login() → authService.login() → 
Backend API → Store token in localStorage → Update AuthContext → 
Navigate to /dashboard
```

### 3. **Protected Route Flow**
```
ProtectedRoute → Check user state → 
If loading → Show spinner → 
If no user → Redirect to /login → 
If user exists → Render protected component
```

### 4. **User Management Flow (Admin Only)**
```
UsersPage → userService.getUsers() → Backend API → 
Display users → Handle CRUD operations → Update local state
```

## 🎯 Component Breakdown

### **App.tsx** - Main Router
```typescript
// Routes configuration
- /test → TestPage (public)
- /login → LoginPage (public)
- /register → RegisterPage (public)
- /dashboard → DashboardPage (protected)
- /users → UsersPage (protected, admin only)
- /* → Redirect to /test
```

### **AuthContext.tsx** - State Management
```typescript
// State
- user: User | null
- isLoading: boolean
- isAuthenticated: boolean

// Methods
- login(credentials): Promise<void>
- register(credentials): Promise<void>
- logout(): void
```

### **LoginForm.tsx** - Authentication UI
```typescript
// Features
- Email/password form
- Error handling
- Loading states
- Navigation to dashboard on success
- Link to registration
```

### **DashboardPage.tsx** - User Dashboard
```typescript
// Features
- Display user information
- Role-based navigation
- Logout functionality
- User status indicators
```

### **UsersPage.tsx** - Admin User Management
```typescript
// Features
- User list display
- Search functionality
- Create new users
- Update user roles
- Delete users
- Role-based access control
```

## 🔐 Authentication Flow Details

### **Login Process**
1. **User Input** → LoginForm component
2. **Form Validation** → Client-side validation
3. **API Call** → authService.login()
4. **Backend Response** → JWT token + user data
5. **State Update** → AuthContext updates user state
6. **Token Storage** → localStorage.setItem('token')
7. **Navigation** → Redirect to /dashboard

### **Token Management**
```typescript
// Token Storage
localStorage.setItem('token', response.access_token);

// Token Retrieval
const token = localStorage.getItem('token');

// Token Usage
headers: {
  'Authorization': `Bearer ${token}`
}

// Token Cleanup
localStorage.removeItem('token');
```

### **Route Protection**
```typescript
// ProtectedRoute Logic
if (isLoading) → Show spinner
if (!user) → Redirect to /login
if (requiredRole && user.role !== requiredRole) → Redirect to /dashboard
else → Render children
```

## 🎨 UI/UX Features

### **Styling**
- **Tailwind CSS** for styling
- **Responsive design** for mobile/desktop
- **Loading states** with spinners
- **Error handling** with user-friendly messages
- **Form validation** with real-time feedback

### **User Experience**
- **Automatic redirects** based on authentication state
- **Persistent sessions** using localStorage
- **Role-based navigation** (admin sees user management)
- **Confirmation dialogs** for destructive actions
- **Search functionality** for user lists

## 🔧 API Integration

### **Authentication Endpoints**
```typescript
// Login
POST /api/auth/login
Body: { email, password }
Response: { access_token, user }

// Register
POST /api/auth/register
Body: { username, email, password }
Response: { access_token, user }

// Get Current User
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

### **User Management Endpoints**
```typescript
// Get All Users (Admin)
GET /api/users
Headers: Authorization: Bearer <token>
Response: User[]

// Create User (Admin)
POST /api/users
Headers: Authorization: Bearer <token>
Body: { username, email, password }
Response: User

// Update User Role (Admin)
PUT /api/users/{id}
Headers: Authorization: Bearer <token>
Body: { role }
Response: User

// Delete User (Admin)
DELETE /api/users/{id}
Headers: Authorization: Bearer <token>
Response: { ok: true }
```

## 🚀 Key Features

### **✅ Implemented**
- User authentication (login/register)
- JWT token management
- Protected routes
- Role-based access control
- User management (CRUD operations)
- Responsive UI with Tailwind CSS
- Error handling and loading states
- Search functionality
- Form validation

### **🔄 State Management**
- **AuthContext** for authentication state
- **localStorage** for token persistence
- **React Router** for navigation
- **useState/useEffect** for component state

### **🔒 Security Features**
- **Protected routes** prevent unauthorized access
- **Role-based navigation** shows admin features only to admins
- **Token validation** on app startup
- **Automatic logout** on token expiration

## 📱 User Journey

### **New User Journey**
1. Visit app → Redirected to /test
2. Click "Login" → Navigate to /login
3. Fill login form → Submit credentials
4. Authentication success → Redirect to /dashboard
5. View user information and available actions

### **Admin User Journey**
1. Login as admin → Access to all features
2. Dashboard shows "Manage Users" button
3. Click "Manage Users" → Navigate to /users
4. View all users, create, update, delete
5. Search and filter users

### **Regular User Journey**
1. Login as user → Limited access
2. Dashboard shows only user information
3. No access to user management
4. Can view own profile and logout

## 🛠️ Development Features

### **Error Handling**
- Network error detection
- API error parsing
- User-friendly error messages
- Graceful fallbacks

### **Loading States**
- Spinner during authentication
- Loading indicators for API calls
- Disabled buttons during operations

### **Debug Features**
- Console logging for API calls
- Token validation checks
- User state debugging

This frontend provides a complete user management system with authentication, role-based access control, and a modern, responsive UI. 