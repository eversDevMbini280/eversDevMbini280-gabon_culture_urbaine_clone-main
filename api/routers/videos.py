from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
import os
import uuid
import shutil

router = APIRouter()

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join("uploads", "videos", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"filename": filename, "url": f"/api/videos/{filename}"}

@router.get("/{filename}")
async def get_video(filename: str):
    filepath = os.path.join("uploads", "videos", filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(filepath)