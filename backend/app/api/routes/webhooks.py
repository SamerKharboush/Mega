from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import json

from app.config import settings

router = APIRouter()


@router.post("/modal")
async def modal_webhook(
    request: Request,
    authorization: Optional[str] = Header(None),
):
    """Handle webhooks from Modal (serverless GPU)."""
    if authorization != f"Bearer {settings.api_secret_key}":
        raise HTTPException(status_code=401, detail="Unauthorized")

    body = await request.json()
    event_type = body.get("type")

    if event_type == "analysis.complete":
        # Update analysis with results
        analysis_id = body.get("analysis_id")
        results = body.get("results")

        # In production, update Supabase
        print(f"Analysis {analysis_id} complete: {results}")

    elif event_type == "analysis.error":
        analysis_id = body.get("analysis_id")
        error = body.get("error")
        print(f"Analysis {analysis_id} failed: {error}")

    return {"status": "received"}


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
):
    """Handle Stripe webhooks. Note: main handling is in frontend."""
    # This is a backup handler for server-side processing
    body = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # Verify and process in frontend Next.js app
    # This endpoint is mainly for logging/monitoring

    return {"status": "received"}