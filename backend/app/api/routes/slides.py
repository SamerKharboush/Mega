from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from pydantic import BaseModel
from supabase import create_client, Client
import httpx

from app.config import settings

router = APIRouter()


def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


class SlideCreate(BaseModel):
    filename: str
    storage_path: str
    format: str


class SlideResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    storage_path: str
    format: str
    status: str
    tile_count: Optional[int]
    dzi_path: Optional[str]
    width_px: Optional[int]
    height_px: Optional[int]
    created_at: str


class SlideList(BaseModel):
    slides: List[SlideResponse]


@router.get("/", response_model=SlideList)
async def list_slides(
    user_id: str = Depends(lambda: None),  # Would be extracted from auth
    supabase: Client = Depends(get_supabase),
):
    """List all slides for a user."""
    response = supabase.table("slides").select("*").execute()
    return SlideList(slides=response.data)


@router.get("/{slide_id}", response_model=SlideResponse)
async def get_slide(
    slide_id: str,
    supabase: Client = Depends(get_supabase),
):
    """Get a specific slide by ID."""
    response = supabase.table("slides").select("*").eq("id", slide_id).single().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Slide not found")

    return SlideResponse(**response.data)


@router.post("/", response_model=SlideResponse, status_code=201)
async def create_slide(
    slide: SlideCreate,
    authorization: Optional[str] = Header(None),
    supabase: Client = Depends(get_supabase),
):
    """Create a new slide record."""
    # Verify API secret key
    if authorization != f"Bearer {settings.api_secret_key}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    response = supabase.table("slides").insert({
        "filename": slide.filename,
        "storage_path": slide.storage_path,
        "format": slide.format,
        "status": "uploaded",
    }).execute()

    return SlideResponse(**response.data[0])


@router.post("/{slide_id}/process")
async def process_slide(
    slide_id: str,
    authorization: Optional[str] = Header(None),
    supabase: Client = Depends(get_supabase),
):
    """Trigger slide processing (tile generation)."""
    # Verify API secret key
    if authorization != f"Bearer {settings.api_secret_key}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Update status to processing
    supabase.table("slides").update({"status": "processing"}).eq("id", slide_id).execute()

    # In production, this would trigger a Celery task
    # from app.services.wsi_processor import process_slide_task
    # process_slide_task.delay(slide_id)

    return {"status": "processing", "slide_id": slide_id}


@router.delete("/{slide_id}")
async def delete_slide(
    slide_id: str,
    supabase: Client = Depends(get_supabase),
):
    """Delete a slide and its associated files."""
    # Get slide info
    response = supabase.table("slides").select("*").eq("id", slide_id).single().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Slide not found")

    slide = response.data

    # Delete from storage
    try:
        supabase.storage.from_(settings.storage_bucket).remove([slide["storage_path"]])
    except Exception:
        pass  # Ignore storage errors

    # Delete from database
    supabase.table("slides").delete().eq("id", slide_id).execute()

    return {"status": "deleted"}