"""
Inference Service
Orchestrates GigaPath and UNI 2 pipelines for pathology analysis.
"""

import asyncio
from typing import List, Dict, Any, Optional
import torch
import numpy as np
from pathlib import Path

from app.config import settings
from app.models.gigapath_pipeline import GigaPathPipeline
from app.models.uni_pipeline import UNIPipeline


class InferenceService:
    """Run inference on pathology slides."""

    def __init__(self):
        self.gigapath = None
        self.uni = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    async def load_models(self):
        """Load models on demand."""
        if self.gigapath is None:
            self.gigapath = GigaPathPipeline(device=self.device)

        if self.uni is None:
            self.uni = UNIPipeline(device=self.device)

    async def run_subtyping(
        self,
        tile_dir: str,
        slide_id: str,
    ) -> Dict[str, Any]:
        """
        Run cancer subtyping analysis.
        """
        await self.load_models()

        # Get tile features using UNI
        features = await self.uni.extract_features(tile_dir)

        # Run GigaPath subtyping
        predictions = await self.gigapath.predict_subtype(features)

        # Generate attention heatmap
        attention_map = await self.gigapath.get_attention_map(features)

        return {
            "predictions": predictions,
            "attention_map": attention_map,
            "model_version": f"gigapath-{settings.gigapath_version}",
        }

    async def run_mutation_prediction(
        self,
        tile_dir: str,
        slide_id: str,
        genes: List[str] = None,
    ) -> Dict[str, Any]:
        """
        Run mutation prediction analysis.
        """
        if genes is None:
            genes = ["EGFR", "KRAS", "TP53", "ALK", "ROS1", "BRAF", "MET", "HER2"]

        await self.load_models()

        # Get tile features
        features = await self.uni.extract_features(tile_dir)

        # Predict mutations
        mutation_scores = await self.gigapath.predict_mutations(features, genes)

        return {
            "mutation_scores": mutation_scores,
            "genes": genes,
            "model_version": f"gigapath-{settings.gigapath_version}",
        }

    async def run_prognosis(
        self,
        tile_dir: str,
        slide_id: str,
    ) -> Dict[str, Any]:
        """
        Run survival prognosis analysis.
        """
        await self.load_models()

        features = await self.uni.extract_features(tile_dir)
        prognosis = await self.gigapath.predict_survival(features)

        return {
            "os_months": prognosis["os_months"],
            "pfs_months": prognosis["pfs_months"],
            "risk_score": prognosis["risk_score"],
            "model_version": f"gigapath-{settings.gigapath_version}",
        }

    async def run_ihc_quantification(
        self,
        tile_dir: str,
        slide_id: str,
        marker: str = "HER2",
    ) -> Dict[str, Any]:
        """
        Run IHC marker quantification.
        """
        await self.load_models()

        features = await self.uni.extract_features(tile_dir)
        quantification = await self.gigapath.quantify_ihc(features, marker)

        return {
            "marker": marker,
            "score": quantification["score"],
            "percentage": quantification["percentage"],
            "intensity": quantification["intensity"],
            "model_version": f"gigapath-{settings.gigapath_version}",
        }


async def run_analysis_task(analysis_id: str):
    """Celery task to run an analysis."""
    from supabase import create_client
    import time

    supabase = create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )

    # Get analysis details
    response = supabase.table("analyses").select(
        "*, slides(storage_path)"
    ).eq("id", analysis_id).single().execute()

    analysis = response.data
    task = analysis["task"]
    slide_id = analysis["slide_id"]

    start_time = time.time()

    try:
        # Update status
        supabase.table("analyses").update({
            "status": "running"
        }).eq("id", analysis_id).execute()

        # Run inference
        service = InferenceService()

        tile_dir = f"/data/processed/{slide_id}/inference"

        if task == "subtype":
            result = await service.run_subtyping(tile_dir, slide_id)
            results = {
                "predictions": result["predictions"],
                "confidence": max(p["score"] for p in result["predictions"]),
                "uncertainty": 100 - max(p["score"] for p in result["predictions"]),
            }

        elif task == "mutation":
            result = await service.run_mutation_prediction(tile_dir, slide_id)
            results = {
                "mutation_scores": result["mutation_scores"],
                "confidence": sum(result["mutation_scores"].values()) / len(result["mutation_scores"]),
            }

        elif task == "prognosis":
            result = await service.run_prognosis(tile_dir, slide_id)
            results = {
                "survival_prediction": {
                    "os_months": result["os_months"],
                    "pfs_months": result["pfs_months"],
                },
                "confidence": 85,  # Placeholder
            }

        elif task == "ihc":
            result = await service.run_ihc_quantification(tile_dir, slide_id)
            results = {
                "ihc_result": result,
                "confidence": 90,
            }

        else:
            raise ValueError(f"Unknown task: {task}")

        duration_ms = int((time.time() - start_time) * 1000)

        # Update with results
        supabase.table("analyses").update({
            "status": "done",
            "results": results,
            "model_version": result.get("model_version"),
            "duration_ms": duration_ms,
        }).eq("id", analysis_id).execute()

        return results

    except Exception as e:
        supabase.table("analyses").update({
            "status": "error",
        }).eq("id", analysis_id).execute()

        raise e