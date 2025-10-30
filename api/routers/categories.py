from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database
from . import auth  

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"],
)

@router.get("/", response_model=List[schemas.CategoryResponse])
def get_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """Get all categories"""
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@router.get("/{category_id}", response_model=schemas.CategoryResponse)
def get_category(category_id: int, db: Session = Depends(database.get_db)):
    """Get a specific category"""
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new category"""
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create categories")
    
    # Check if category name already exists
    existing = db.query(models.Category).filter(models.Category.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")
    
    # Create category
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Update a category"""
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update categories")
    
    # Get category
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if new name already exists (if name is being changed)
    if category.name and category.name != db_category.name:
        existing = db.query(models.Category).filter(models.Category.name == category.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category name already exists")
    
    # Update category fields
    for key, value in category.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.check_admin_privileges)
):
    """Delete a category"""
    # Check if category exists
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has articles
    articles_count = db.query(models.Article).filter(models.Article.category_id == category_id).count()
    if articles_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category because it has {articles_count} articles. Remove or reassign these articles first."
        )
    
    # Delete category
    db.delete(db_category)
    db.commit()
    
    return None