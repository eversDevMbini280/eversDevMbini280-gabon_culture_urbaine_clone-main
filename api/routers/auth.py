from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import Depends, HTTPException, status, APIRouter, Response, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import logging
from database import get_db
from models import User

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "your-refresh-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class Token(BaseModel):
    access_token: str
    refresh_token: str  
    token_type: str
    user_info: dict

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class RefreshTokenRequest(BaseModel):  
    refresh_token: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    disabled: bool
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "editor"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    disabled: Optional[bool] = None






# Utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def verify_token(token: str, key: str):
    try:
        payload = jwt.decode(token, key, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT verification error: {str(e)}")
        return None

async def get_current_user(
    request: Request,  # Add request parameter
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(token, SECRET_KEY)
        if payload is None:
            logger.warning("Invalid token signature or format")
            raise credentials_exception
            
        username: str = payload.get("sub")
        if username is None:
            logger.warning("Token missing 'sub' field")
            raise credentials_exception
            
        token_exp = payload.get("exp")
        if token_exp is None:
            logger.warning("Token missing 'exp' field")
            raise credentials_exception
            
        # FIX: Use UTC timestamp comparison
        if datetime.utcfromtimestamp(token_exp) < datetime.utcnow():
            logger.warning("Token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError as e:
        logger.error(f"JWT Error: {str(e)}")
        raise credentials_exception
    
    user = get_user(db, username=username)
    if user is None:
        logger.warning(f"User '{username}' not found in database")
        raise credentials_exception
    request.state.user = user

        
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.disabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user

def check_admin_privileges(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.post("/login", response_model=Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = get_user(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        data={"sub": user.username},
        expires_delta=refresh_token_expires
    )
    
    logger.info(f"Created access token for {user.username}, expires in {ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
    logger.info(f"Created refresh token for {user.username}")
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,  # Include in response
        "token_type": "bearer",
        "user_info": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@router.post("/refresh", response_model=Token)
async def refresh_token_endpoint(
    refresh_request: RefreshTokenRequest,  # Accept token in body
    db: Session = Depends(get_db)
):
    refresh_token = refresh_request.refresh_token
    if not refresh_token:
        logger.error("Refresh token missing in request")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
    
    payload = verify_token(refresh_token, REFRESH_SECRET_KEY)
    if not payload:
        logger.error("Invalid refresh token format or signature")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
        
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )
    
    token_exp = payload.get("exp")
    if token_exp and datetime.fromtimestamp(token_exp) < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )
    
    user = get_user(db, username=username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    new_access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    new_refresh_token = create_refresh_token(
        data={"sub": user.username},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    logger.info(f"Refreshed tokens for {user.username}")
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user_info": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_privileges)
):
    return db.query(User).all()

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,  
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin_privileges)
):
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | 
        (User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        disabled=False
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )
    
    return db_user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user






@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_privileges)  # Changed here
):
    db_user = db.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db_user.username == "gcadmin":
        raise HTTPException(status_code=403, detail="Cannot delete primary admin")
    
    try:
        db.delete(db_user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting user")



@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_privileges)  # Changed here
):
    db_user = db.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent modifying primary admin
    if db_user.username == "gcadmin" and current_user.id != db_user.id:
        raise HTTPException(status_code=403, detail="Cannot modify primary admin")

    update_data = user_data.dict(exclude_unset=True)
    
    if "password" in update_data:
        db_user.password_hash = get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating user")