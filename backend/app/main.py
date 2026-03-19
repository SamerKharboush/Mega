from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

logger.info("Starting application initialization...")

from app.config import settings

# Initialize Sentry only if DSN is provided
if settings.sentry_dsn:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.1,
            profiles_sample_rate=0.1,
        )
        logger.info("Sentry initialized")
    except Exception as e:
        logger.warning(f"Failed to initialize Sentry: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.app_name}...")
    logger.info(f"Debug mode: {settings.debug}")

    # Import and include routers on startup with error handling
    try:
        logger.info("Loading routers...")
        from app.api.routes import slides, analyses, reports, webhooks
        app.include_router(slides.router, prefix="/api/slides", tags=["slides"])
        app.include_router(analyses.router, prefix="/api/analyses", tags=["analyses"])
        app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
        app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])
        logger.info("Routers loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load routers: {e}")
        import traceback
        traceback.print_exc()
        # Don't raise - let the app start anyway for healthcheck

    yield

    # Shutdown
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.app_name,
    description="AI-powered digital pathology API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://pathai-studio.vercel.app",
        "https://frontend-one-pink-50.vercel.app",
        "https://mega-wdvv.onrender.com",
        "https://mega-production-d392.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Mega API", "docs": "/docs", "health": "/health"}


# Health check - must work even if routers fail to load
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)