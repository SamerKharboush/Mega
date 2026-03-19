from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import List
from pydantic import BaseModel
from supabase import create_client, Client
from datetime import datetime
import io

from app.config import settings

router = APIRouter()


def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


class ReportResponse(BaseModel):
    id: str
    analysis_id: str
    user_id: str
    filename: str
    storage_path: str
    created_at: str


class ReportList(BaseModel):
    reports: List[ReportResponse]


@router.get("/", response_model=ReportList)
async def list_reports(
    supabase: Client = Depends(get_supabase),
):
    """List all reports."""
    response = supabase.table("reports").select("*").order("created_at", desc=True).execute()
    return ReportList(reports=response.data)


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    supabase: Client = Depends(get_supabase),
):
    """Get a specific report."""
    response = supabase.table("reports").select("*").eq("id", report_id).single().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Report not found")

    return ReportResponse(**response.data)


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    supabase: Client = Depends(get_supabase),
):
    """Download a PDF report."""
    # Get report info
    response = supabase.table("reports").select("*").eq("id", report_id).single().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Report not found")

    report = response.data

    # Get signed URL for download
    signed_url = supabase.storage.from_(settings.storage_bucket).create_signed_url(
        report["storage_path"], 3600
    )

    # Download file
    import httpx
    async with httpx.AsyncClient() as client:
        file_response = await client.get(signed_url["signedURL"])

    return StreamingResponse(
        io.BytesIO(file_response.content),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{report["filename"]}"'
        }
    )


@router.post("/generate/{analysis_id}", response_model=ReportResponse, status_code=201)
async def generate_report(
    analysis_id: str,
    supabase: Client = Depends(get_supabase),
):
    """Generate a PDF report for an analysis."""
    # Get analysis with results
    analysis_response = supabase.table("analyses").select(
        "*, slides(filename, width_px, height_px)"
    ).eq("id", analysis_id).single().execute()

    if not analysis_response.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    analysis = analysis_response.data

    if analysis["status"] != "done":
        raise HTTPException(status_code=400, detail="Analysis not complete")

    # Generate PDF
    from app.services.report_generator import generate_pathology_report
    pdf_bytes = await generate_pathology_report(analysis)

    # Upload to storage
    filename = f"{analysis['slides']['filename'].rsplit('.', 1)[0]}_report.pdf"
    storage_path = f"reports/{analysis['user_id']}/{analysis_id}.pdf"

    supabase.storage.from_(settings.storage_bucket).upload(
        storage_path,
        pdf_bytes,
        {"content-type": "application/pdf"}
    )

    # Create report record
    report_response = supabase.table("reports").insert({
        "analysis_id": analysis_id,
        "user_id": analysis["user_id"],
        "filename": filename,
        "storage_path": storage_path,
    }).execute()

    # Update analysis with report path
    supabase.table("analyses").update({
        "report_path": storage_path
    }).eq("id", analysis_id).execute()

    return ReportResponse(**report_response.data[0])