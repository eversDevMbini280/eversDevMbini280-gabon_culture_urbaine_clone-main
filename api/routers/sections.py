from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from . import auth  

router = APIRouter(
    prefix="/api/sections",
    tags=["sections"],
)

@router.get("/", response_model=List[schemas.SectionResponse])
def get_sections(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """Get all sections"""
    sections = db.query(models.Section).offset(skip).limit(limit).all()
    return sections

@router.get("/{section_id}", response_model=schemas.SectionResponse)
def get_section(section_id: int, db: Session = Depends(database.get_db)):
    """Get a specific section"""
    section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if section is None:
        raise HTTPException(status_code=404, detail="Section not found")
    return section

@router.post("/", response_model=schemas.SectionResponse, status_code=status.HTTP_201_CREATED)
def create_section(
    section: schemas.SectionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new section"""
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create sections")
    
    # Check if section name already exists
    existing = db.query(models.Section).filter(models.Section.name == section.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Section name already exists")
    
    # Create section
    db_section = models.Section(**section.dict())
    db.add(db_section)
    db.commit()
    db.refresh(db_section)
    
    return db_section

@router.put("/{section_id}", response_model=schemas.SectionResponse)
def update_section(
    section_id: int,
    section: schemas.SectionUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_admin_privileges)
):
    """Update a section"""
    # Get section
    db_section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Check if new name already exists (if name is being changed)
    if section.name and section.name != db_section.name:
        existing = db.query(models.Section).filter(models.Section.name == section.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Section name already exists")
    
    # Update section fields
    for key, value in section.dict(exclude_unset=True).items():
        setattr(db_section, key, value)
    
    db.commit()
    db.refresh(db_section)
    
    return db_section

@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    section_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_admin_privileges)
):
    """Delete a section"""
    # Check if section exists
    db_section = db.query(models.Section).filter(models.Section.id == section_id).first()
    if not db_section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Check if section has articles
    articles_count = db.query(models.Article).filter(models.Article.section_id == section_id).count()
    if articles_count > 0:
        # Set section_id to NULL for all associated articles
        db.query(models.Article).filter(models.Article.section_id == section_id).update(
            {models.Article.section_id: None}
        )
    
    # Delete section
    db.delete(db_section)
    db.commit()
    
    return None