from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
import os
from datetime import datetime
from .auth import get_current_user
from database import get_db
from models import Advertisement, AdvertisementStatus, User, AdvertisementPage
from schemas import AdvertisementResponse, AdvertisementDetailResponse, AdvertisementStatus, UserResponse

router = APIRouter(
    prefix="/api/advertisements",
    tags=["Advertisements"]
)

# Utility function to save uploaded files
async def save_file(file: UploadFile, upload_dir: str = "uploads/advertisements"):
    os.makedirs(upload_dir, exist_ok=True)
    file_extension = file.filename.split('.')[-1]
    file_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return f"/{file_path}"

@router.get("/", response_model=List[AdvertisementResponse])
def get_advertisements(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    status: str = None,
    limit: int = 10,
    skip: int = 0
):
    query = db.query(Advertisement)
    
    if status:
        query = query.filter(Advertisement.status == status)
    
    advertisements = query.offset(skip).limit(limit).all()
    return advertisements

@router.get("/public", response_model=List[AdvertisementResponse])
def get_public_advertisements(
    page: str = None,
    db: Session = Depends(get_db)
):
    # Map hyphenated page values from request to enum values with underscores
    page_mapping = {
        "homepage": "homepage",
        "actualite": "actualite",
        "culture-urbaine": "culture_urbaine",
        "arts-traditions": "arts_traditions",
        "sciences": "sciences",
        "evenements": "evenements",
        "entrepreneuriat": "entrepreneuriat",
        "direct-tv": "direct_tv",
        "all": "all"
    }
    
    # Convert the incoming page value to the enum-compatible value
    mapped_page = page_mapping.get(page, page) if page else None
    
    query = db.query(Advertisement).filter(
        Advertisement.status == AdvertisementStatus.published
    )
    
    if mapped_page:
        query = query.filter(
            (Advertisement.page == mapped_page) | (Advertisement.page == AdvertisementPage.all)
        )
    
    advertisements = query.order_by(func.random()).all()
    return advertisements

@router.get("/{id}", response_model=AdvertisementDetailResponse)
def get_advertisement(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    advertisement = db.query(Advertisement).filter(Advertisement.id == id).first()
    if not advertisement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advertisement not found")
    return advertisement

@router.post("/", response_model=AdvertisementResponse)
async def create_advertisement(
    file: UploadFile = File(...),
    title: str = Form(...),
    redirect_url: str = Form(None),
    category_id: int = Form(None),
    status: AdvertisementStatus = Form(AdvertisementStatus.draft),
    page: AdvertisementPage = Form(AdvertisementPage.all),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    image_url = await save_file(file)
    
    new_advertisement = Advertisement(
        title=title,
        image_url=image_url,
        redirect_url=redirect_url,
        status=status,
        category_id=category_id,
        created_by_id=current_user.id,
        page=page
    )
    
    db.add(new_advertisement)
    db.commit()
    db.refresh(new_advertisement)
    return new_advertisement

@router.put("/{id}", response_model=AdvertisementResponse)
async def update_advertisement(
    id: int,
    file: UploadFile = File(None),
    title: str = Form(None),
    redirect_url: str = Form(None),
    category_id: int = Form(None),
    status: AdvertisementStatus = Form(None),
    page: AdvertisementPage = Form(None),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    advertisement = db.query(Advertisement).filter(Advertisement.id == id).first()
    if not advertisement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advertisement not found")
    
    if file:
        advertisement.image_url = await save_file(file)
    
    if title:
        advertisement.title = title
    if redirect_url:
        advertisement.redirect_url = redirect_url
    if category_id:
        advertisement.category_id = category_id
    if status:
        advertisement.status = status
    if page:
        advertisement.page = page
    
    db.commit()
    db.refresh(advertisement)
    return advertisement

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_advertisement(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    advertisement = db.query(Advertisement).filter(Advertisement.id == id).first()
    if not advertisement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advertisement not found")
    
    # Delete the associated image file from the filesystem
    image_path = advertisement.image_url.lstrip('/')
    if os.path.exists(image_path):
        try:
            os.remove(image_path)
        except OSError as e:
            print(f"Error deleting file {image_path}: {e}")

    db.delete(advertisement)
    db.commit()