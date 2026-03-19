"""
WSI Processing Service
Handles whole-slide image tiling and DZI generation.
"""

import os
import asyncio
from pathlib import Path
from typing import Optional, Tuple
import json

import large_image
from large_image_source_openslide import OpenslideTileSource

from app.config import settings


class WSIProcessor:
    """Process whole-slide images for analysis."""

    def __init__(self, slide_id: str, storage_path: str):
        self.slide_id = slide_id
        self.storage_path = storage_path
        self.tile_size = 256
        self.overlap = 0
        self.magnification = 20  # Target magnification

    async def get_slide_metadata(self, local_path: str) -> dict:
        """Extract metadata from WSI file."""
        ts = large_image.open(local_path)
        metadata = ts.getMetadata()

        return {
            "width": metadata["sizeX"],
            "height": metadata["sizeY"],
            "tile_width": metadata["tileWidth"],
            "tile_height": metadata["tileHeight"],
            "magnification": metadata.get("magnification"),
            "mm_x": metadata.get("mm_x"),
            "mm_y": metadata.get("mm_y"),
            "levels": len(ts.getTileScales()),
        }

    async def generate_tiles(
        self,
        local_path: str,
        output_dir: str,
    ) -> Tuple[int, str]:
        """
        Generate tiles for a whole-slide image.
        Returns (tile_count, dzi_path).
        """
        ts = large_image.open(local_path)
        tile_count = 0

        # Create output directory
        os.makedirs(output_dir, exist_ok=True)

        # Generate DZI (Deep Zoom Image) for web viewer
        dzi_path = os.path.join(output_dir, f"{self.slide_id}.dzi")

        # Use large_image's DZI generation
        ts.write(
            dzi_path,
            format="dzi",
            tile_size=self.tile_size,
            overlap=self.overlap,
        )

        # Count tiles at target magnification
        tile_count = ts.getTileCount(
            format={"magnification": self.magnification}
        )

        return tile_count, dzi_path

    async def extract_tiles_for_inference(
        self,
        local_path: str,
        output_dir: str,
        patch_size: int = 256,
        stride: Optional[int] = None,
    ) -> int:
        """
        Extract tiles for model inference.
        Returns number of patches extracted.
        """
        if stride is None:
            stride = patch_size

        ts = large_image.open(local_path)
        os.makedirs(output_dir, exist_ok=True)

        tile_count = 0
        coords = []

        # Get tile iterator at target magnification
        tile_iterator = ts.tileIterator(
            format={"magnification": self.magnification},
            tile_size={"width": patch_size, "height": patch_size},
            tile_overlap={"x": 0, "y": 0},
        )

        for tile_info in tile_iterator:
            # Save tile
            tile_path = os.path.join(output_dir, f"tile_{tile_count:06d}.png")
            tile_info["tile"].save(tile_path)

            # Save coordinates
            coords.append({
                "x": tile_info["x"],
                "y": tile_info["y"],
                "width": tile_info["width"],
                "height": tile_info["height"],
            })

            tile_count += 1

        # Save coordinates file
        with open(os.path.join(output_dir, "coordinates.json"), "w") as f:
            json.dump(coords, f)

        return tile_count

    async def process(self, local_path: str) -> dict:
        """Full processing pipeline."""
        output_dir = os.path.join(settings.storage_bucket, "processed", self.slide_id)

        # Get metadata
        metadata = await self.get_slide_metadata(local_path)

        # Generate DZI for viewer
        tile_count, dzi_path = await self.generate_tiles(local_path, output_dir)

        # Extract tiles for inference
        inference_dir = os.path.join(output_dir, "inference")
        inference_tile_count = await self.extract_tiles_for_inference(
            local_path, inference_dir
        )

        return {
            "metadata": metadata,
            "tile_count": tile_count,
            "dzi_path": dzi_path,
            "inference_tile_count": inference_tile_count,
            "inference_dir": inference_dir,
        }


async def process_slide_task(slide_id: str, storage_path: str, local_path: str):
    """Celery task to process a slide."""
    from supabase import create_client

    supabase = create_client(
        settings.supabase_url,
        settings.supabase_service_role_key
    )

    try:
        processor = WSIProcessor(slide_id, storage_path)
        result = await processor.process(local_path)

        # Update slide record
        supabase.table("slides").update({
            "status": "ready",
            "tile_count": result["tile_count"],
            "dzi_path": result["dzi_path"],
            "width_px": result["metadata"]["width"],
            "height_px": result["metadata"]["height"],
        }).eq("id", slide_id).execute()

        return result

    except Exception as e:
        # Update status to error
        supabase.table("slides").update({
            "status": "error",
        }).eq("id", slide_id).execute()

        raise e