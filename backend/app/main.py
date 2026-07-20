import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import get_settings
from .database import Base, SessionLocal, engine
from .routers import admin, enquiry, promotion
from .seed import seed_defaults

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # For standalone/local use tables are created directly; in the hosted portal
    # run migrations/001_website_promotion.sql (or your Alembic pipeline) instead.
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_defaults(db)
    yield


app = FastAPI(
    title="Website Promotion API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/website-promotion/docs",
    openapi_url="/api/website-promotion/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Flatten Pydantic errors into {field: message} so the frontend can show inline errors."""
    field_errors: dict[str, str] = {}
    for err in exc.errors():
        loc = [str(part) for part in err.get("loc", []) if part != "body"]
        field = ".".join(loc) or "form"
        message = err.get("msg", "Invalid value.")
        message = message.removeprefix("Value error, ")
        field_errors.setdefault(field, message)
    return JSONResponse(
        status_code=422,
        content={"detail": "Please correct the highlighted fields.", "field_errors": field_errors},
    )


@app.get("/api/website-promotion/health")
def health():
    return {"status": "ok"}


app.include_router(promotion.router)
app.include_router(enquiry.router)
app.include_router(admin.router)

# Optional: if a built frontend (frontend/dist) is present next to this repo
# — e.g. when running everything locally on one machine — serve it from this
# same process too. On the deployed setup (frontend on Vercel, backend on
# Render) frontend/dist won't exist on the Render build, so this whole block
# is inert there; Vercel serves the frontend independently.
_frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
_frontend_index = _frontend_dist / "index.html"

if _frontend_dist.is_dir():
    # Vite's hashed bundle (JS/CSS) lives under /assets — serve it directly.
    app.mount("/assets", StaticFiles(directory=str(_frontend_dist / "assets")), name="frontend-assets")

    @app.exception_handler(StarletteHTTPException)
    async def spa_fallback(request: Request, exc: StarletteHTTPException):
        """Any unmatched GET that isn't an API call is a client-side route
        (e.g. a hard refresh on /admin/website-leads) — hand it index.html
        so React Router can take over. API 404s stay JSON."""
        if (
            exc.status_code == 404
            and request.method == "GET"
            and not request.url.path.startswith("/api")
            and _frontend_index.is_file()
        ):
            return FileResponse(_frontend_index)
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
