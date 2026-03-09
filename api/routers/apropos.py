# from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
# from sqlalchemy.orm import Session
# from typing import List
# import schemas
# import models
# from database import get_db
# from datetime import datetime
# import os
# import uuid
# from fastapi.responses import FileResponse
# from .auth import get_current_user
# from PIL import Image
# import io

# router = APIRouter(
#     prefix="/apropos",
#     tags=["About Page"]
# )

# # Ensure upload directory exists
# UPLOAD_DIR = "static/uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Helper function to validate and save uploaded image
# async def save_uploaded_file(upload_file: UploadFile) -> str:
#     # Validate file extension
#     allowed_extensions = {'.png', '.jpg', '.jpeg'}
#     file_ext = os.path.splitext(upload_file.filename)[1].lower()
#     if file_ext not in allowed_extensions:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
#         )

#     # Read file content
#     content = await upload_file.read()
    
#     # Validate and process image
#     try:
#         image = Image.open(io.BytesIO(content))
#         width, height = image.size
        
#         # Resize to 500x500 if not square or not 500x500
#         target_size = 500
#         if width != height or width != target_size:
#             # Convert to RGB if necessary (e.g., for PNG with transparency)
#             if image.mode in ('RGBA', 'LA'):
#                 background = Image.new('RGB', image.size, (255, 255, 255))
#                 background.paste(image, mask=image.convert('RGBA').split()[3])
#                 image = background
#             elif image.mode != 'RGB':
#                 image = image.convert('RGB')
            
#             # Calculate crop or padding
#             if width > height:
#                 left = (width - height) // 2
#                 right = left + height
#                 top = 0
#                 bottom = height
#                 image = image.crop((left, top, right, bottom))
#             elif height > width:
#                 top = (height - width) // 2
#                 bottom = top + width
#                 left = 0
#                 right = width
#                 image = image.crop((left, top, right, bottom))
            
#             # Resize to 500x500
#             image = image.resize((target_size, target_size), Image.Resampling.LANCZOS)
        
#         # Save image to buffer to check size
#         buffer = io.BytesIO()
#         image.save(buffer, format='JPEG', quality=85)
#         image_data = buffer.getvalue()
        
#         # Check file size (2MB limit)
#         if len(image_data) > 2 * 1024 * 1024:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Image file size exceeds 2MB limit"
#             )
        
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Invalid image file: {str(e)}"
#         )
    
#     # Generate unique filename
#     unique_filename = f"{uuid.uuid4()}.jpg"
#     file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
#     # Save file
#     with open(file_path, "wb") as buffer:
#         buffer.write(image_data)
    
#     return f"/static/uploads/{unique_filename}"

# # TeamMember Endpoints
# @router.post("/team-members/", response_model=schemas.TeamMemberResponse)
# async def create_team_member(
#     name: str = Form(...),
#     role: str = Form(...),
#     bio: str = Form(None),
#     image: UploadFile = File(None),
#     db: Session = Depends(get_db)
# ):
#     image_url = None
#     if image:
#         image_url = await save_uploaded_file(image)
    
#     db_team_member = models.TeamMember(
#         name=name,
#         role=role,
#         bio=bio,
#         image_url=image_url
#     )
#     db.add(db_team_member)
#     db.commit()
#     db.refresh(db_team_member)
#     return db_team_member

# @router.get("/team-members/", response_model=List[schemas.TeamMemberResponse])
# def get_team_members(db: Session = Depends(get_db)):
#     return db.query(models.TeamMember).all()

# @router.get("/team-members/{id}", response_model=schemas.TeamMemberResponse)
# def get_team_member(id: int, db: Session = Depends(get_db)):
#     team_member = db.query(models.TeamMember).filter(models.TeamMember.id == id).first()
#     if not team_member:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
#     return team_member

# @router.put("/team-members/{id}", response_model=schemas.TeamMemberResponse)
# async def update_team_member(
#     id: int,
#     name: str = Form(None),
#     role: str = Form(None),
#     bio: str = Form(None),
#     image: UploadFile = File(None),
#     db: Session = Depends(get_db)
# ):
#     db_team_member = db.query(models.TeamMember).filter(models.TeamMember.id == id).first()
#     if not db_team_member:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
    
#     # Update fields if provided
#     if name is not None:
#         db_team_member.name = name
#     if role is not None:
#         db_team_member.role = role
#     if bio is not None:
#         db_team_member.bio = bio
#     if image:
#         # Delete old image if exists
#         if db_team_member.image_url and os.path.exists(db_team_member.image_url[1:]):  # Remove leading slash
#             os.remove(db_team_member.image_url[1:])
#         # Save new image
#         db_team_member.image_url = await save_uploaded_file(image)
    
#     db_team_member.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_team_member)
#     return db_team_member

# @router.delete("/team-members/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_team_member(id: int, db: Session = Depends(get_db)):
#     db_team_member = db.query(models.TeamMember).filter(models.TeamMember.id == id).first()
#     if not db_team_member:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
#     # Delete image file if exists
#     if db_team_member.image_url and os.path.exists(db_team_member.image_url[1:]):
#         os.remove(db_team_member.image_url[1:])
#     db.delete(db_team_member)
#     db.commit()

# # Milestone Endpoints
# @router.post("/milestones/", response_model=schemas.MilestoneResponse)
# def create_milestone(milestone: schemas.MilestoneCreate, db: Session = Depends(get_db)):
#     db_milestone = models.Milestone(**milestone.dict())
#     db.add(db_milestone)
#     db.commit()
#     db.refresh(db_milestone)
#     return db_milestone

# @router.get("/milestones/", response_model=List[schemas.MilestoneResponse])
# def get_milestones(db: Session = Depends(get_db)):
#     return db.query(models.Milestone).all()

# @router.get("/milestones/{id}", response_model=schemas.MilestoneResponse)
# def get_milestone(id: int, db: Session = Depends(get_db)):
#     milestone = db.query(models.Milestone).filter(models.Milestone.id == id).first()
#     if not milestone:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
#     return milestone

# @router.put("/milestones/{id}", response_model=schemas.MilestoneResponse)
# def update_milestone(id: int, milestone: schemas.MilestoneUpdate, db: Session = Depends(get_db)):
#     db_milestone = db.query(models.Milestone).filter(models.Milestone.id == id).first()
#     if not db_milestone:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
#     update_data = milestone.dict(exclude_unset=True)
#     for key, value in update_data.items():
#         setattr(db_milestone, key, value)
#     db_milestone.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_milestone)
#     return db_milestone

# @router.delete("/milestones/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_milestone(id: int, db: Session = Depends(get_db)):
#     db_milestone = db.query(models.Milestone).filter(models.Milestone.id == id).first()
#     if not db_milestone:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
#     db.delete(db_milestone)
#     db.commit()

# # Stat Endpoints
# @router.post("/stats/", response_model=schemas.StatResponse)
# def create_stat(stat: schemas.StatCreate, db: Session = Depends(get_db)):
#     db_stat = models.Stat(**stat.dict())
#     db.add(db_stat)
#     db.commit()
#     db.refresh(db_stat)
#     return db_stat

# @router.get("/stats/", response_model=List[schemas.StatResponse])
# def get_stats(db: Session = Depends(get_db)):
#     return db.query(models.Stat).all()

# @router.get("/stats/{id}", response_model=schemas.StatResponse)
# def get_stat(id: int, db: Session = Depends(get_db)):
#     stat = db.query(models.Stat).filter(models.Stat.id == id).first()
#     if not stat:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")
#     return stat

# @router.put("/stats/{id}", response_model=schemas.StatResponse)
# def update_stat(id: int, stat: schemas.StatUpdate, db: Session = Depends(get_db)):
#     db_stat = db.query(models.Stat).filter(models.Stat.id == id).first()
#     if not db_stat:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")
#     update_data = stat.dict(exclude_unset=True)
#     for key, value in update_data.items():
#         setattr(db_stat, key, value)
#     db_stat.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_stat)
#     return db_stat

# @router.delete("/stats/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_stat(id: int, db: Session = Depends(get_db)):
#     db_stat = db.query(models.Stat).filter(models.Stat.id == id).first()
#     if not db_stat:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")
#     db.delete(db_stat)
#     db.commit()

# # Value Endpoints
# @router.post("/values/", response_model=schemas.ValueResponse)
# def create_value(value: schemas.ValueCreate, db: Session = Depends(get_db)):
#     db_value = models.Value(**value.dict())
#     db.add(db_value)
#     db.commit()
#     db.refresh(db_value)
#     return db_value

# @router.get("/values/", response_model=List[schemas.ValueResponse])
# def get_values(db: Session = Depends(get_db)):
#     return db.query(models.Value).all()

# @router.get("/values/{id}", response_model=schemas.ValueResponse)
# def get_value(id: int, db: Session = Depends(get_db)):
#     value = db.query(models.Value).filter(models.Value.id == id).first()
#     if not value:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Value not found")
#     return value

# @router.put("/values/{id}", response_model=schemas.ValueResponse)
# def update_value(id: int, value: schemas.ValueUpdate, db: Session = Depends(get_db)):
#     db_value = db.query(models.Value).filter(models.Value.id == id).first()
#     if not db_value:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Value not found")
#     update_data = value.dict(exclude_unset=True)
#     for key, value in update_data.items():
#         setattr(db_value, key, value)
#     db_value.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_value)
#     return db_value

# @router.delete("/values/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_value(id: int, db: Session = Depends(get_db)):
#     db_value = db.query(models.Value).filter(models.Value.id == id).first()
#     if not db_value:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Value not found")
#     db.delete(db_value)
#     db.commit()

# # ContactInfo Endpoints
# @router.post("/contact-info/", response_model=schemas.ContactInfoResponse)
# def create_contact_info(contact_info: schemas.ContactInfoCreate, db: Session = Depends(get_db)):
#     db_contact_info = models.ContactInfo(**contact_info.dict())
#     db.add(db_contact_info)
#     db.commit()
#     db.refresh(db_contact_info)
#     return db_contact_info

# @router.get("/contact-info/", response_model=List[schemas.ContactInfoResponse])
# def get_contact_info(db: Session = Depends(get_db)):
#     return db.query(models.ContactInfo).all()

# @router.get("/contact-info/{id}", response_model=schemas.ContactInfoResponse)
# def get_contact_info_by_id(id: int, db: Session = Depends(get_db)):
#     contact_info = db.query(models.ContactInfo).filter(models.ContactInfo.id == id).first()
#     if not contact_info:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact info not found")
#     return contact_info

# @router.put("/contact-info/{id}", response_model=schemas.ContactInfoResponse)
# def update_contact_info(id: int, contact_info: schemas.ContactInfoUpdate, db: Session = Depends(get_db)):
#     db_contact_info = db.query(models.ContactInfo).filter(models.ContactInfo.id == id).first()
#     if not db_contact_info:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact info not found")
#     update_data = contact_info.dict(exclude_unset=True)
#     for key, value in update_data.items():
#         setattr(db_contact_info, key, value)
#     db_contact_info.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_contact_info)
#     return db_contact_info

# @router.delete("/contact-info/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_contact_info(id: int, db: Session = Depends(get_db)):
#     db_contact_info = db.query(models.ContactInfo).filter(models.ContactInfo.id == id).first()
#     if not db_contact_info:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact info not found")
#     db.delete(db_contact_info)
#     db.commit()

# @router.post("/studios/", response_model=schemas.StudioResponse)
# async def create_studio(
#     title: str = Form(...),
#     description: str = Form(...),
#     features: str = Form(...),
#     collaboration_text: str = Form(...),
#     image: UploadFile = File(None),
#     db: Session = Depends(get_db)
# ):
#     image_path = None
#     if image:
#         image_path = await save_uploaded_file(image)
    
#     db_studio = models.Studio(
#         title=title,
#         description=description,
#         features=features,
#         collaboration_text=collaboration_text,
#         image_path=image_path
#     )
#     db.add(db_studio)
#     db.commit()
#     db.refresh(db_studio)
#     return db_studio

# @router.get("/studios/", response_model=List[schemas.StudioResponse])
# def get_studios(db: Session = Depends(get_db)):
#     return db.query(models.Studio).all()

# @router.put("/studios/{id}", response_model=schemas.StudioResponse)
# async def update_studio(
#     id: int,
#     title: str = Form(None),
#     description: str = Form(None),
#     features: str = Form(None),
#     collaboration_text: str = Form(None),
#     image: UploadFile = File(None),
#     db: Session = Depends(get_db)
# ):
#     db_studio = db.query(models.Studio).filter(models.Studio.id == id).first()
#     if not db_studio:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Studio not found")
    
#     if title is not None:
#         db_studio.title = title
#     if description is not None:
#         db_studio.description = description
#     if features is not None:
#         db_studio.features = features
#     if collaboration_text is not None:
#         db_studio.collaboration_text = collaboration_text
#     if image:
#         if db_studio.image_path and os.path.exists(db_studio.image_path[1:]):
#             os.remove(db_studio.image_path[1:])
#         db_studio.image_path = await save_uploaded_file(image)
    
#     db_studio.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_studio)
#     return db_studio

# @router.delete("/studios/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_studio(id: int, db: Session = Depends(get_db)):
#     db_studio = db.query(models.Studio).filter(models.Studio.id == id).first()
#     if not db_studio:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Studio not found")
#     if db_studio.image_path and os.path.exists(db_studio.image_path[1:]):
#         os.remove(db_studio.image_path[1:])
#     db.delete(db_studio)
#     db.commit()

# # About Content Endpoints
# @router.get("/about-content/", response_model=List[schemas.AboutContentResponse])
# def get_about_content(db: Session = Depends(get_db)):
#     return db.query(models.AboutContent).all()

# @router.post("/about-content", response_model=schemas.AboutContentResponse)
# def create_about_content(about_content: schemas.AboutContentCreate, db: Session = Depends(get_db)):
#     db_about_content = models.AboutContent(**about_content.dict())
#     db.add(db_about_content)
#     db.commit()
#     db.refresh(db_about_content)
#     return db_about_content

# @router.put("/about-content/{id}", response_model=schemas.AboutContentResponse)
# def update_about_content(id: int, about_content: schemas.AboutContentUpdate, db: Session = Depends(get_db)):
#     db_about_content = db.query(models.AboutContent).filter(models.AboutContent.id == id).first()
#     if not db_about_content:
#         raise HTTPException(status_code=404, detail="About content not found")
#     update_data = about_content.dict(exclude_unset=True)
#     for key, value in update_data.items():
#         setattr(db_about_content, key, value)
#     db_about_content.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(db_about_content)
#     return db_about_content

# @router.delete("/about-content/{id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_about_content(id: int, db: Session = Depends(get_db)):
#     db_about_content = db.query(models.AboutContent).filter(models.AboutContent.id == id).first()
#     if not db_about_content:
#         raise HTTPException(status_code=404, detail="About content not found")
#     db.delete(db_about_content)
#     db.commit() 


from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import schemas
import models
from database import get_db
from datetime import datetime
import os
import uuid
from fastapi.responses import FileResponse
from .auth import get_current_user
from PIL import Image

import io

router = APIRouter(
    prefix="/apropos",
    tags=["About Page"]
)

# Ensure upload directory exists
STATIC_DIR = "static"
UPLOAD_DIR = f"{STATIC_DIR}/uploads"
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Helper function to validate and save uploaded image
async def save_uploaded_file(upload_file: UploadFile, target_size=(400, 600)) -> str:
    # Validate file extension
    allowed_extensions = {'.png', '.jpg', '.jpeg'}
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Read file content
    content = await upload_file.read()
    
    # Validate and process image
    try:
        image = Image.open(io.BytesIO(content))
        width, height = image.size
        target_width, target_height = target_size
        target_ratio = target_width / target_height  # e.g., 400/600 = 0.666 (portrait)
        current_ratio = width / height
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.convert('RGBA').split()[3])
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Crop to portrait aspect ratio (target_ratio < 1)
        if current_ratio > target_ratio:  # Image is too wide (landscape)
            new_width = int(height * target_ratio)
            left = (width - new_width) // 2
            right = left + new_width
            top = 0
            bottom = height
            image = image.crop((left, top, right, bottom))
        elif current_ratio < target_ratio:  # Image is too tall
            new_height = int(width / target_ratio)
            top = (height - new_height) // 2
            bottom = top + new_height
            left = 0
            right = width
            image = image.crop((left, top, right, bottom))
        
        # Resize to target size
        image = image.resize(target_size, Image.Resampling.LANCZOS)
        
        # Save to buffer and check size
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        image_data = buffer.getvalue()
        
        if len(image_data) > 2 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image file size exceeds 2MB limit"
            )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image file: {str(e)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}.jpg"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(image_data)
    
    return f"/static/uploads/{unique_filename}"

# TeamMember Endpoints
@router.post("/team-members/", response_model=schemas.TeamMemberResponse)
async def create_team_member(
    name: str = Form(...),
    role: str = Form(...),
    bio: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    image_url = None
    if image:
        image_url = await save_uploaded_file(image, target_size=(400, 600))  # Portrait size
    
    db_team_member = models.TeamMember(name=name, role=role, bio=bio, image_url=image_url)
    db.add(db_team_member)
    db.commit()
    db.refresh(db_team_member)
    return db_team_member

@router.get("/team-members/", response_model=List[schemas.TeamMemberResponse])
def get_team_members(db: Session = Depends(get_db)):
    return db.query(models.TeamMember).all()

@router.get("/team-members/{id}", response_model=schemas.TeamMemberResponse)
def get_team_member(id: int, db: Session = Depends(get_db)):
    team_member = db.query(models.TeamMember).filter(models.TeamMember.id == id).first()
    if not team_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
    return team_member

@router.put("/team-members/{id}", response_model=schemas.TeamMemberResponse)
async def update_team_member(
    id: int,
    name: str = Form(None),
    role: str = Form(None),
    bio: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_team_member = db.query(models.TeamMember).filter(models.TeamMember.id == id).first()
    if not db_team_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
    
    if name is not None:
        db_team_member.name = name
    if role is not None:
        db_team_member.role = role
    if bio is not None:
        db_team_member.bio = bio
    if image:
        if db_team_member.image_url and os.path.exists(db_team_member.image_url[1:]):
            os.remove(db_team_member.image_url[1:])
        db_team_member.image_url = await save_uploaded_file(image, target_size=(400, 600))  # Portrait size
    
    db_team_member.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_team_member)
    return db_team_member

@router.delete("/team-members/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_member(id: int, db: Session = Depends(get_db)):
    db_team_member = db.query(models.TeamMember).filter(models.TeamMember.id == id).first()
    if not db_team_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")
    # Delete image file if exists
    if db_team_member.image_url and os.path.exists(db_team_member.image_url[1:]):
        os.remove(db_team_member.image_url[1:])
    db.delete(db_team_member)
    db.commit()

# Milestone Endpoints
@router.post("/milestones/", response_model=schemas.MilestoneResponse)
def create_milestone(milestone: schemas.MilestoneCreate, db: Session = Depends(get_db)):
    db_milestone = models.Milestone(**milestone.dict())
    db.add(db_milestone)
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.get("/milestones/", response_model=List[schemas.MilestoneResponse])
def get_milestones(db: Session = Depends(get_db)):
    return db.query(models.Milestone).all()

@router.get("/milestones/{id}", response_model=schemas.MilestoneResponse)
def get_milestone(id: int, db: Session = Depends(get_db)):
    milestone = db.query(models.Milestone).filter(models.Milestone.id == id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return milestone

@router.put("/milestones/{id}", response_model=schemas.MilestoneResponse)
def update_milestone(id: int, milestone: schemas.MilestoneUpdate, db: Session = Depends(get_db)):
    db_milestone = db.query(models.Milestone).filter(models.Milestone.id == id).first()
    if not db_milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    update_data = milestone.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_milestone, key, value)
    db_milestone.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_milestone)
    return db_milestone

@router.delete("/milestones/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(id: int, db: Session = Depends(get_db)):
    db_milestone = db.query(models.Milestone).filter(models.Milestone.id == id).first()
    if not db_milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    db.delete(db_milestone)
    db.commit()

# Stat Endpoints
@router.post("/stats/", response_model=schemas.StatResponse)
def create_stat(stat: schemas.StatCreate, db: Session = Depends(get_db)):
    db_stat = models.Stat(**stat.dict())
    db.add(db_stat)
    db.commit()
    db.refresh(db_stat)
    return db_stat

@router.get("/stats/", response_model=List[schemas.StatResponse])
def get_stats(db: Session = Depends(get_db)):
    return db.query(models.Stat).all()

@router.get("/stats/{id}", response_model=schemas.StatResponse)
def get_stat(id: int, db: Session = Depends(get_db)):
    stat = db.query(models.Stat).filter(models.Stat.id == id).first()
    if not stat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")
    return stat

@router.put("/stats/{id}", response_model=schemas.StatResponse)
def update_stat(id: int, stat: schemas.StatUpdate, db: Session = Depends(get_db)):
    db_stat = db.query(models.Stat).filter(models.Stat.id == id).first()
    if not db_stat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")
    update_data = stat.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_stat, key, value)
    db_stat.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_stat)
    return db_stat

@router.delete("/stats/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stat(id: int, db: Session = Depends(get_db)):
    db_stat = db.query(models.Stat).filter(models.Stat.id == id).first()
    if not db_stat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")
    db.delete(db_stat)
    db.commit()

# Value Endpoints
@router.post("/values/", response_model=schemas.ValueResponse)
def create_value(value: schemas.ValueCreate, db: Session = Depends(get_db)):
    db_value = models.Value(**value.dict())
    db.add(db_value)
    db.commit()
    db.refresh(db_value)
    return db_value

@router.get("/values/", response_model=List[schemas.ValueResponse])
def get_values(db: Session = Depends(get_db)):
    return db.query(models.Value).all()

@router.get("/values/{id}", response_model=schemas.ValueResponse)
def get_value(id: int, db: Session = Depends(get_db)):
    value = db.query(models.Value).filter(models.Value.id == id).first()
    if not value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Value not found")
    return value

@router.put("/values/{id}", response_model=schemas.ValueResponse)
def update_value(id: int, value: schemas.ValueUpdate, db: Session = Depends(get_db)):
    db_value = db.query(models.Value).filter(models.Value.id == id).first()
    if not db_value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Value not found")
    update_data = value.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_value, key, value)
    db_value.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_value)
    return db_value

@router.delete("/values/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_value(id: int, db: Session = Depends(get_db)):
    db_value = db.query(models.Value).filter(models.Value.id == id).first()
    if not db_value:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Value not found")
    db.delete(db_value)
    db.commit()

# ContactInfo Endpoints
@router.post("/contact-info/", response_model=schemas.ContactInfoResponse)
def create_contact_info(contact_info: schemas.ContactInfoCreate, db: Session = Depends(get_db)):
    db_contact_info = models.ContactInfo(**contact_info.dict())
    db.add(db_contact_info)
    db.commit()
    db.refresh(db_contact_info)
    return db_contact_info

@router.get("/contact-info/", response_model=List[schemas.ContactInfoResponse])
def get_contact_info(db: Session = Depends(get_db)):
    return db.query(models.ContactInfo).all()

@router.get("/contact-info/{id}", response_model=schemas.ContactInfoResponse)
def get_contact_info_by_id(id: int, db: Session = Depends(get_db)):
    contact_info = db.query(models.ContactInfo).filter(models.ContactInfo.id == id).first()
    if not contact_info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact info not found")
    return contact_info

@router.put("/contact-info/{id}", response_model=schemas.ContactInfoResponse)
def update_contact_info(id: int, contact_info: schemas.ContactInfoUpdate, db: Session = Depends(get_db)):
    db_contact_info = db.query(models.ContactInfo).filter(models.ContactInfo.id == id).first()
    if not db_contact_info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact info not found")
    update_data = contact_info.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contact_info, key, value)
    db_contact_info.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_contact_info)
    return db_contact_info

@router.delete("/contact-info/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_info(id: int, db: Session = Depends(get_db)):
    db_contact_info = db.query(models.ContactInfo).filter(models.ContactInfo.id == id).first()
    if not db_contact_info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact info not found")
    db.delete(db_contact_info)
    db.commit()

# Studio Endpoints
@router.post("/studios/", response_model=schemas.StudioResponse)
async def create_studio(
    title: str = Form(...),
    description: str = Form(...),
    features: str = Form(...),
    collaboration_text: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    image_path = None
    if image:
        image_path = await save_uploaded_file(image, target_size=(400, 600))  # Portrait size
    
    db_studio = models.Studio(
        title=title,
        description=description,
        features=features,
        collaboration_text=collaboration_text,
        image_path=image_path
    )
    db.add(db_studio)
    db.commit()
    db.refresh(db_studio)
    return db_studio

@router.get("/studios/", response_model=List[schemas.StudioResponse])
def get_studios(db: Session = Depends(get_db)):
    return db.query(models.Studio).all()

@router.put("/studios/{id}", response_model=schemas.StudioResponse)
async def update_studio(
    id: int,
    title: str = Form(None),
    description: str = Form(None),
    features: str = Form(None),
    collaboration_text: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_studio = db.query(models.Studio).filter(models.Studio.id == id).first()
    if not db_studio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Studio not found")
    
    if title is not None:
        db_studio.title = title
    if description is not None:
        db_studio.description = description
    if features is not None:
        db_studio.features = features
    if collaboration_text is not None:
        db_studio.collaboration_text = collaboration_text
    if image:
        if db_studio.image_path and os.path.exists(db_studio.image_path[1:]):
            os.remove(db_studio.image_path[1:])
        db_studio.image_path = await save_uploaded_file(image, target_size=(400, 600))  # Portrait size
    
    db_studio.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_studio)
    return db_studio

@router.delete("/studios/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_studio(id: int, db: Session = Depends(get_db)):
    db_studio = db.query(models.Studio).filter(models.Studio.id == id).first()
    if not db_studio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Studio not found")
    if db_studio.image_path and os.path.exists(db_studio.image_path[1:]):
        os.remove(db_studio.image_path[1:])
    db.delete(db_studio)
    db.commit()

# About Content Endpoints
@router.get("/about-content/", response_model=List[schemas.AboutContentResponse])
def get_about_content(db: Session = Depends(get_db)):
    return db.query(models.AboutContent).all()

@router.post("/about-content", response_model=schemas.AboutContentResponse)
def create_about_content(about_content: schemas.AboutContentCreate, db: Session = Depends(get_db)):
    db_about_content = models.AboutContent(**about_content.dict())
    db.add(db_about_content)
    db.commit()
    db.refresh(db_about_content)
    return db_about_content

@router.put("/about-content/{id}", response_model=schemas.AboutContentResponse)
def update_about_content(id: int, about_content: schemas.AboutContentUpdate, db: Session = Depends(get_db)):
    db_about_content = db.query(models.AboutContent).filter(models.AboutContent.id == id).first()
    if not db_about_content:
        raise HTTPException(status_code=404, detail="About content not found")
    update_data = about_content.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_about_content, key, value)
    db_about_content.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_about_content)
    return db_about_content

@router.delete("/about-content/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_about_content(id: int, db: Session = Depends(get_db)):
    db_about_content = db.query(models.AboutContent).filter(models.AboutContent.id == id).first()
    if not db_about_content:
        raise HTTPException(status_code=404, detail="About content not found")
    db.delete(db_about_content)
    db.commit()
