from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, database

router = APIRouter(prefix="/api/artists", tags=["artists"])

@router.get("/", response_model=List[schemas.ArtistResponse])
def get_artists(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    category_id: Optional[int] = None,  
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Artist)
    if type:
        query = query.filter(models.Artist.type == type)
    if category_id:
        query = query.filter(models.Artist.category_id == category_id)
    artists = query.order_by(models.Artist.created_at.desc()).offset(skip).limit(limit).all()
    return artists  # Returns [] if no artists are found

@router.get("/{artist_id}", response_model=schemas.ArtistResponse)
def get_artist(artist_id: int, db: Session = Depends(database.get_db)):
    artist = db.query(models.Artist).filter(models.Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist