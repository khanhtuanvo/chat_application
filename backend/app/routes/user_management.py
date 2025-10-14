from ..schemas.user import UserCanChatPermissionUpdate, UserCreate, UserResponse, UserRoleUpdate, UserLoginPermissionUpdate
from ..database import get_db 
from ..dependencies.auth import require_authenticated, require_admin
from sqlalchemy.orm import Session 
from fastapi import APIRouter, HTTPException, status, Depends 
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from ..models.user import User, UserRole
from ..services.auth_service import auth_service


router = APIRouter(tags=["Admin"])
security = HTTPBearer()

@router.post("/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        # Check if current user is admin
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Check if email already exists
        existing_user_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_user_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Email already registered"
            )
        
        # Check if username already exists
        existing_user_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_user_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Username already registered"
            )

        # Hash the password
        hashed_password = auth_service.hash_password(user_data.password)
        
        # Create new user
        new_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            is_active=False,
            is_verified=False,
            role=UserRole.USER  # Default role for admin-created users
        )

        # Save to database
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_role(
    user_id: int,
    user_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if user.role == UserRole.USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    user_in_db = db.query(User).filter(User.id == user_id).first()
    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user_in_db.id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update your own role"
        )
    
    user_in_db.role = user_data.role
    
    
    # Save changes to database
    db.commit()
    db.refresh(user_in_db)
    
    return user_in_db

@router.put("/users/{user_id}/login_permission", response_model=UserResponse)
def update_login_permission(
    user_id: int,
    user_data: UserLoginPermissionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    user_in_db = db.query(User).filter(User.id == user_id).first()

    if not user_in_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


    if user_in_db.id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update your own login permission"
        )

    user_in_db.is_active = user_data.is_active 

    db.commit()
    db.refresh(user_in_db)

    return user_in_db

#Update user can chat permission
@router.put("/users/{user_id}/can_chat", response_model=UserResponse)
def update_can_chat_permission(
    user_id: int,
    user_data: UserCanChatPermissionUpdate, 
    db: Session = Depends(get_db),
    user: User = Depends(require_authenticated),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    user_in_db = db.query(User).filter(User.id == user_id).first()

    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user_in_db.id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update your own chat permission"
        )

    user_in_db.can_chat = user_data.can_chat

    db.commit()
    db.refresh(user_in_db)

    return user_in_db

    

@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), user: User = Depends(require_authenticated), credentials: HTTPAuthorizationCredentials = Depends(security)):
    #Only admin can get all users
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )

    user_list = db.query(User).order_by(User.id).all()
    # Convert to UserResponse schema for proper serialization
    return [UserResponse.model_validate(user) for user in user_list]

@router.delete("/users/{user_id}")
def delete_specific_user(user_id: int, db: Session = Depends(get_db), user: User = Depends(require_authenticated), credentials: HTTPAuthorizationCredentials = Depends(security)):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    existed_user = db.query(User).filter(User.id == user_id).first()
    if not existed_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if existed_user.id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(existed_user)
    db.commit()

    return {"ok": True}
    