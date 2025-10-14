from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, user_management, user_profile, chat
from .config import settings

app = FastAPI(
    title="User Management System",
    description="A comprehensive user management system with role-based access control",
    version="1.0.0",
    debug=settings.debug
)

origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(user_management.router, prefix="/api")
app.include_router(user_profile.router, prefix="/api")
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
async def root():
    return {"message": "User Management System is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

