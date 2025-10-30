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
    # Handle CORS preflight requests first
    if request.method == "OPTIONS":
        # For OPTIONS requests, return a response immediately with CORS headers
        return JSONResponse(
            content={},
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Max-Age": "86400",
            }
        )
    
    # For non-OPTIONS requests, proceed with normal flow
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
    
    # Ensure CORS headers are present for all responses
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

# CORS configuration with expanded origins and settings
# This middleware is applied after our custom middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,  # Set to False when using wildcard "*" origin
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Content-Length", "X-Process-Time", "Authorization"],
    max_age=86400  # Cache preflight requests for 24 hours
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
    
    # Always add CORS headers to error responses
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

# Special OPTIONS handler for all routes
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
