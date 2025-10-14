from ..database import get_db 
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from ..models.user import User, UserRole
from ..services.auth_service import auth_service
from ..dependencies.auth import require_authenticated


router = APIRouter(tags=["Authentication"])

@router.post("/setup", response_model=UserResponse)
def setup_admin_user(db: Session = Depends(get_db)):
    """
    Create an admin user for testing purposes.
    This endpoint should only be used in development.
    """
    # Check if admin user already exists
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    
    if admin_user:
        return admin_user
    
    # Create admin user
    admin_user = User(
        email="admin@example.com",
        username="admin",
        hashed_password=auth_service.hash_password("Admin123*"),
        can_chat=True,
        is_active=True,
        is_verified=True,
        role=UserRole.ADMIN
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return admin_user

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        existing_user_email = db.query(User).filter(User.email == user.email).first()
        if existing_user_email:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email has already registered")
        
        existing_user_username = db.query(User).filter(User.username == user.username).first()
        if existing_user_username:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username has already registered")
        
        hashed_password = auth_service.hash_password(user.password)
        db_user = User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            is_active=False,
            is_verified=False,
            role=UserRole.USER
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    user_data = db.query(User).filter(User.email == user.email).first()
    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email does not exist") 
    is_correct_password = auth_service.verify_password(user.password, user_data.hashed_password)
    if not is_correct_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password is incorrect")
    if not user_data.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is not active")

    # Update last login time
    auth_service.update_last_login(db, user_data)
    
    # Use user ID instead of email in token
    access_token = auth_service.create_access_token(data={"sub": str(user_data.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user_data)
    )


@router.post("/logout")
def logout_user():
    return {"response": "Sign out successfully"}

@router.get("/me", response_model=UserResponse)
def get_current_user(user: User = Depends(require_authenticated)):
    """
    Get current user information
    """
    return user
    