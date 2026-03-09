# from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Request
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from sqlalchemy.orm import Session
# from typing import List, Optional
# import os
# import shutil
# import uuid
# from datetime import datetime
# from database import get_db, SessionLocal
# from models import Article, User, Category, Section
# from schemas import ArticleResponse, ArticleCreate, ArticleUpdate
# from routers import articles, sections, categories, articles2, articles3, users, directv
# from routers.auth import router as auth_router
# import logging

# app = FastAPI(title="Gabon Culture Urbaine API")

# # Configure logging
# logger = logging.getLogger(__name__)

# # Add middleware for last activity tracking
# @app.middleware("http")
# async def update_last_activity(request: Request, call_next):
#     response = await call_next(request)
    
#     try:
#         # Check if user is authenticated
#         if hasattr(request.state, "user") and request.state.user:
#             db = SessionLocal()
#             try:
#                 # Get the user object from request state
#                 current_user = request.state.user
                
#                 # Refresh the user instance from database
#                 db_user = db.merge(current_user)
                
#                 # Update last activity with UTC time
#                 db_user.last_activity = datetime.utcnow() 
                
#                 # Commit the change
#                 db.commit()
#                 logger.info(f"Updated last activity for user {db_user.username}")
                
#             except Exception as e:
#                 db.rollback()
#                 logger.error(f"Error updating last activity: {str(e)}")
#             finally:
#                 db.close()
#     except AttributeError as e:
#         logger.warning(f"Request state error: {str(e)}")
    
#     return response


# # CORS configuration
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://localhost:10000",
#         "https://gabon-culture-urbaine.onrender.com",
#         "https://gabon-culture-urbaine-1.onrender.com"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
#     expose_headers=["Content-Range", "Content-Length"]
# )

# os.makedirs("uploads/images", exist_ok=True)
# os.makedirs("uploads/videos", exist_ok=True)

# # Mount static files
# app.mount("/static", StaticFiles(directory="static"), name="static")

# # Include routers
# app.include_router(articles.router)
# app.include_router(articles2.router)
# app.include_router(articles3.router)
# app.include_router(categories.router)
# app.include_router(sections.router)
# app.include_router(auth_router)
# app.include_router(users.router)
# app.include_router(directv.router)

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
from datetime import datetime
import logging

from database import get_db, SessionLocal
from models import Article, User, Category, Section
from schemas import ArticleResponse, ArticleCreate, ArticleUpdate
from routers import articles, sections, categories, articles2, articles3, users, directv, upcoming_program, images, apropos, articles4, articles5, articles6, articlesactual
from routers.auth import router as auth_router

app = FastAPI(title="Gabon Culture Urbaine API")

LOCAL_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s:%(name)s: %(message)s",
    datefmt="%b %d %I:%M:%S %p",
)
logger = logging.getLogger(__name__)

# Add middleware for last activity tracking
@app.middleware("http")
async def update_last_activity(request: Request, call_next):
    response = await call_next(request)
    
    try:
        # Check if user is authenticated
        if hasattr(request.state, "user") and request.state.user:
            db = SessionLocal()
            try:
                # Get the user object from request state
                current_user = request.state.user
                
                # Refresh the user instance from database
                db_user = db.merge(current_user)
                
                # Update last activity with UTC time
                db_user.last_activity = datetime.utcnow() 
                
                # Commit the change
                db.commit()
                logger.info(f"Updated last activity for user {db_user.username}")
                
            except Exception as e:
                db.rollback()
                logger.error(f"Error updating last activity: {str(e)}")
            finally:
                db.close()
    except AttributeError as e:
        logger.warning(f"Request state error: {str(e)}")
    
    return response

# CORS configuration for local frontend <-> local backend communication.
app.add_middleware(
    CORSMiddleware,
    allow_origins=LOCAL_CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Content-Length", "X-Process-Time", "Authorization"],
    max_age=86400
)

# Ensure upload directories exist
os.makedirs("uploads/images", exist_ok=True)
os.makedirs("uploads/videos", exist_ok=True)

# Mount static files and uploads for serving
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(articles.router)
app.include_router(articles2.router)
app.include_router(articles3.router)
app.include_router(articles4.router)
app.include_router(articles5.router)
app.include_router(articles6.router)
app.include_router(categories.router)
app.include_router(sections.router)
app.include_router(auth_router)
app.include_router(users.router)
app.include_router(directv.router)
app.include_router(upcoming_program.router)
app.include_router(images.router)
app.include_router(apropos.router)
app.include_router(articlesactual.router)


# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Gabon Culture Urbaine API"}

# Global exception handler for CORS headers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        detail = exc.detail
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        detail = "Internal server error"
        logger.error(f"Unhandled exception: {str(exc)}")
    
    response = JSONResponse(
        status_code=status_code,
        content={"detail": detail}
    )
    
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
