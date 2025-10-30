from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
import sqlalchemy  
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import logging
import os

from models import Event, EventStatus, Category, User
from schemas import EventCreate, EventResponse, EventDetailResponse, EventUpdate, UserResponse
from database import get_db
from .auth import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/events",
    tags=["events"],
)

# Update EventCreate schema to include image_url
class EventCreate(BaseModel):
    title: str
    description: str
    category_id: int
    location: str
    venue: str
    date: datetime
    end_date: Optional[datetime] = None
    time: str
    status: str
    is_featured: bool = False
    attendees: Optional[int] = 0
    contact: str
    tickets_available: bool = False
    ticket_price: Optional[str] = None
    ticket_url: Optional[str] = None
    organizer_id: int
    image_url: Optional[str] = None

# Helper function to check user role
def check_user_role(user: UserResponse, required_role: str):
    if user.role != required_role:
        raise HTTPException(status_code=403, detail="Operation not permitted")

@router.get("/", response_model=List[EventDetailResponse])
def get_events(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search term for title, description, venue, or location"),
    category: Optional[str] = Query(None),
    filter: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100
):
    """
    Fetch events with optional search, category, and status filters.
    """
    query = db.query(Event).options(
        sqlalchemy.orm.joinedload(Event.category),
        sqlalchemy.orm.joinedload(Event.organizer)
    )

    if search:
        search = search.lower()
        query = query.filter(
            (Event.title.ilike(f"%{search}%")) |
            (Event.description.ilike(f"%{search}%")) |
            (Event.location.ilike(f"%{search}%")) |
            (Event.venue.ilike(f"%{search}%"))
        )

    if category and category != "all":
        query = query.join(Category).filter(Category.name == category)

    if filter:
        if filter == "featured":
            query = query.filter(Event.is_featured == True)
        elif filter == "upcoming":
            query = query.filter(Event.date >= datetime.utcnow())
        elif filter == "past":
            query = query.filter(Event.date < datetime.utcnow())

    events = query.offset(skip).limit(limit).all()
    return events

@router.post("/", response_model=EventDetailResponse)
def create_event(
    title: str = Form(...),
    description: str = Form(...),
    category_id: int = Form(...),
    location: str = Form(...),
    venue: str = Form(...),
    date: str = Form(...),
    end_date: Optional[str] = Form(None),
    time: str = Form(...),
    status: str = Form(...),
    is_featured: bool = Form(False),
    attendees: int = Form(0),
    contact: str = Form(...),
    tickets_available: bool = Form(False),
    ticket_price: Optional[str] = Form(None),
    ticket_url: Optional[str] = Form(None),
    organizer_id: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a new event with an optional image, accepting multipart form data.
    """
    logger.info(f"Received event data: title={title}, category_id={category_id}, organizer_id={organizer_id}")
    check_user_role(current_user, "admin")

    # Validate category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Validate organizer exists
    organizer = db.query(User).filter(User.id == organizer_id).first()
    if not organizer:
        raise HTTPException(status_code=404, detail=f"Organizer with ID {organizer_id} not found")

    # Parse dates
    try:
        date_obj = datetime.fromisoformat(date.replace("Z", "+00:00"))
        end_date_obj = datetime.fromisoformat(end_date.replace("Z", "+00:00")) if end_date else None
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Invalid date format: {str(e)}")

    # Handle image upload if provided
    image_url = None
    if image:
        image_dir = "static/images"
        os.makedirs(image_dir, exist_ok=True)
        file_location = f"{image_dir}/{image.filename}"
        with open(file_location, "wb") as buffer:
            buffer.write(image.file.read())
        image_url = f"/{file_location}"

    # Create the event
    db_event = Event(
        title=title,
        description=description,
        category_id=category_id,
        location=location,
        venue=venue,
        date=date_obj,
        end_date=end_date_obj,
        time=time,
        status=status,
        is_featured=is_featured,
        attendees=attendees,
        contact=contact,
        tickets_available=tickets_available,
        ticket_price=ticket_price,
        ticket_url=ticket_url,
        organizer_id=organizer_id,
        image_url=image_url
    )

    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.patch("/{event_id}/toggle-featured", response_model=EventDetailResponse)
def toggle_event_featured(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Toggle the featured status of an event.
    """
    check_user_role(current_user, "admin")

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.is_featured = not event.is_featured
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", response_model=dict)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete an event by its ID.
    """
    check_user_role(current_user, "admin")

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Delete the event
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}