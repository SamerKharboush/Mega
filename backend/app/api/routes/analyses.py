from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from supabase import create_client, Client
import asyncio
from datetime import datetime

from app.config import settings

router = APIRouter()


def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


class AnalysisCreate(BaseModel):
    slide_id: str
    task: str  # subtype, mutation, prognosis, ihc, tme


class Prediction(BaseModel):
    label: str
    score: float


class AnalysisResults(BaseModel):
    predictions: List[Prediction]
    confidence: float
    uncertainty: float
    mutation_scores: Optional[Dict[str, float]] = None
    survival_prediction: Optional[Dict[str, float]] = None


class AnalysisResponse(BaseModel):
    id: str
    slide_id: str
    user_id: str
    task: str
    status: str
    model_version: Optional[str]
    results: Optional[AnalysisResults]
    heatmap_path: Optional[str]
    report_path: Optional[str]
    duration_ms: Optional[int]
    created_at: str


class AnalysisList(BaseModel):
    analyses: List[AnalysisResponse]


@router.get("/", response_model=AnalysisList)
async def list_analyses(
    slide_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase),
):
    """List analyses, optionally filtered by slide."""
    query = supabase.table("analyses").select("*, slides(filename)")

    if slide_id:
        query = query.eq("slide_id", slide_id)

    response = query.order("created_at", desc=True).execute()
    return AnalysisList(analyses=response.data)


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    supabase: Client = Depends(get_supabase),
):
    """Get a specific analysis by ID."""
    response = supabase.table("analyses").select("*, slides(filename)").eq("id", analysis_id).single().execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return AnalysisResponse(**response.data)


@router.post("/", response_model=AnalysisResponse, status_code=201)
async def create_analysis(
    analysis: AnalysisCreate,
    authorization: Optional[str] = Header(None),
    supabase: Client = Depends(get_supabase),
):
    """Create a new analysis."""
    if authorization != f"Bearer {settings.api_secret_key}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Get slide info
    slide_response = supabase.table("slides").select("*").eq("id", analysis.slide_id).single().execute()

    if not slide_response.data:
        raise HTTPException(status_code=404, detail="Slide not found")

    # Create analysis record
    response = supabase.table("analyses").insert({
        "slide_id": analysis.slide_id,
        "task": analysis.task,
        "status": "queued",
    }).execute()

    return AnalysisResponse(**response.data[0])


@router.post("/{analysis_id}/run")
async def run_analysis(
    analysis_id: str,
    authorization: Optional[str] = Header(None),
    supabase: Client = Depends(get_supabase),
):
    """Trigger analysis execution."""
    if authorization != f"Bearer {settings.api_secret_key}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Get analysis info
    analysis_response = supabase.table("analyses").select("*").eq("id", analysis_id).single().execute()

    if not analysis_response.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Update status to running
    supabase.table("analyses").update({"status": "running"}).eq("id", analysis_id).execute()

    # In production, trigger Celery task
    # from app.services.inference import run_analysis_task
    # run_analysis_task.delay(analysis_id)

    # For demo, simulate processing
    asyncio.create_task(simulate_analysis(analysis_id, supabase))

    return {"status": "running", "analysis_id": analysis_id}


@router.get("/{analysis_id}/results", response_model=AnalysisResults)
async def get_analysis_results(
    analysis_id: str,
    supabase: Client = Depends(get_supabase),
):
    """Get analysis results."""
    response = supabase.table("analyses").select("results").eq("id", analysis_id).single().execute()

    if not response.data or not response.data.get("results"):
        raise HTTPException(status_code=404, detail="Results not found")

    return AnalysisResults(**response.data["results"])


@router.get("/{analysis_id}/heatmap")
async def get_heatmap(
    analysis_id: str,
    supabase: Client = Depends(get_supabase),
):
    """Get attention heatmap for analysis."""
    response = supabase.table("analyses").select("heatmap_path").eq("id", analysis_id).single().execute()

    if not response.data or not response.data.get("heatmap_path"):
        raise HTTPException(status_code=404, detail="Heatmap not found")

    # Return signed URL for heatmap
    heatmap_url = supabase.storage.from_(settings.storage_bucket).create_signed_url(
        response.data["heatmap_path"], 3600
    )

    return {"url": heatmap_url}


async def simulate_analysis(analysis_id: str, supabase: Client):
    """Simulate analysis processing for demo."""
    await asyncio.sleep(5)  # Simulate processing time

    # Mock results based on task type
    mock_results = {
        "predictions": [
            {"label": "Lung Adenocarcinoma", "score": 87},
            {"label": "Lung Squamous Cell Carcinoma", "score": 8},
            {"label": "Small Cell Lung Cancer", "score": 3},
            {"label": "Large Cell Neuroendocrine", "score": 1},
            {"label": "Pulmonary Carcinoid", "score": 1},
        ],
        "confidence": 94,
        "uncertainty": 6,
        "mutation_scores": {
            "EGFR": 0.72,
            "KRAS": 0.15,
            "TP53": 0.89,
            "ALK": 0.08,
            "ROS1": 0.03,
        },
    }

    supabase.table("analyses").update({
        "status": "done",
        "results": mock_results,
        "model_version": f"gigapath-{settings.gigapath_version}",
        "duration_ms": 5000,
    }).eq("id", analysis_id).execute()