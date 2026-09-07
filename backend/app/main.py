"""FastAPI application factory."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.responses import envelope
from app.db.indexes import ensure_indexes
from app.db.mongodb import close_mongo_connection, connect_to_mongo
from app.middleware.exception_handler import register_exception_handlers
from app.middleware.request_logging import RequestLoggingMiddleware

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    await ensure_indexes()
    yield
    await close_mongo_connection()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Dental Charting System API",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    register_exception_handlers(app)

    app.include_router(api_router)

    @app.get("/", tags=["meta"])
    async def root():
        return envelope(
            {"service": "dental-charting-system", "env": settings.APP_ENV},
            "Dental Charting System API is running",
        )

    @app.get("/health", tags=["meta"])
    async def health():
        from app.db.mongodb import get_database

        await get_database().command("ping")
        return envelope({"database": "connected"}, "Healthy")

    return app


app = create_app()
