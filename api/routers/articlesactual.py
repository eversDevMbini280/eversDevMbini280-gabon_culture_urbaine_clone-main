from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import models  
import schemas 
from database import get_db  
from routers.auth import get_current_user, User  
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/api/actualitehome",
    tags=["Arts Traditions Articles"]
)

# Endpoints
@router.post("/", response_model=schemas.ActualiteHomeResponse)
async def create_actualite(
    actualite: schemas.ActualiteHomeCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if len(actualite.title.strip()) < 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="Title must be at least 5 characters long")
    db_actualite = models.ActualiteHome(**actualite.dict())
    db.add(db_actualite)
    db.commit()
    db.refresh(db_actualite)
    logger.info(f"Created actualite with id {db_actualite.id}")
    return db_actualite

@router.get("/", response_model=List[schemas.ActualiteHomeResponse])
async def list_actualites(db: Session = Depends(get_db)):
    actualites = db.query(models.ActualiteHome).filter(models.ActualiteHome.status == 'published').all()
    logger.info(f"Fetched {len(actualites)} published actualites")
    return actualites

@router.get("/{id}", response_model=schemas.ActualiteHomeResponse)
async def get_actualite(id: int, db: Session = Depends(get_db)):
    actualite = db.query(models.ActualiteHome).filter(models.ActualiteHome.id == id).first()
    if not actualite:
        logger.error(f"Actualite with id {id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="Actualite not found")
    logger.info(f"Fetched actualite with id {id}")
    return actualite

@router.put("/{id}", response_model=schemas.ActualiteHomeResponse)
async def update_actualite(
    id: int, 
    actualite: schemas.ActualiteHomeUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_actualite = db.query(models.ActualiteHome).filter(models.ActualiteHome.id == id).first()
    if not db_actualite:
        logger.error(f"Actualite with id {id} not found for update")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="Actualite not found")
    for key, value in actualite.dict(exclude_unset=True).items():
        if key == "title" and value is not None and len(value.strip()) < 5:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail="Title must be at least 5 characters long")
        setattr(db_actualite, key, value)
    db.commit()
    db.refresh(db_actualite)
    logger.info(f"Updated actualite with id {id}")
    return db_actualite

@router.delete("/{id}", response_model=dict)
async def delete_actualite(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_actualite = db.query(models.ActualiteHome).filter(models.ActualiteHome.id == id).first()
    if not db_actualite:
        logger.error(f"Actualite with id {id} not found for deletion")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="Actualite not found")
    db.delete(db_actualite)
    db.commit()
    logger.info(f"Deleted actualite with id {id}")
    return {"detail": "Actualite deleted successfully"}