# User Management Frontend

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Features

- User registration and login
- Protected routes based on authentication
- Role-based access control (Admin/User)
- Modern UI with Tailwind CSS
- TypeScript for type safety

## Project Structure

```
src/
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       └── ProtectedRoute.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   └── authService.ts
├── types/
│   ├── user.ts
│   └── api.ts
└── App.tsx
```

## Development

The frontend is configured to proxy API requests to the backend at `http://localhost:8000`. Make sure the backend is running before testing the frontend.
