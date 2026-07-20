import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models import DemoWebsite, WebsitePromotionApplication, WebsitePromotionSettings
from ..schemas import (
    ApplicationCreate,
    ApplicationCreated,
    DemoPublic,
    PromotionStatusPublic,
)
from ..utils import RateLimiter, generate_reference_number

logger = logging.getLogger("website_promotion")
settings = get_settings()
router = APIRouter(prefix="/api/website-promotion", tags=["website-promotion"])

rate_limiter = RateLimiter(
    max_requests=settings.rate_limit_max_submissions,
    window_seconds=settings.rate_limit_window_minutes * 60,
)

SUCCESS_MESSAGE = (
    "Your website application has been submitted successfully. Our team will review "
    "your business requirements and contact you if additional details are required."
)


def get_promo_settings(db: Session) -> WebsitePromotionSettings:
    row = db.get(WebsitePromotionSettings, 1)
    if row is None:
        row = WebsitePromotionSettings(id=1)
        db.add(row)
        db.commit()
    return row


def effective_status(row: WebsitePromotionSettings, now: datetime) -> tuple[str, bool]:
    """Returns (public status, applications effectively open)."""
    status = row.promotion_status
    if not row.promotion_enabled:
        status = "applications_temporarily_closed"
    if row.end_date and now > row.end_date:
        status = "offer_ended"
    if row.start_date and now < row.start_date:
        status = "applications_temporarily_closed"
    open_for_applications = (
        row.application_enabled
        and status not in ("offer_ended", "applications_temporarily_closed")
    )
    return status, open_for_applications


@router.get("/status", response_model=PromotionStatusPublic)
def promotion_status(db: Session = Depends(get_db)):
    row = get_promo_settings(db)
    now = datetime.utcnow()
    status, open_for_applications = effective_status(row, now)

    capacity_limit = None
    remaining_capacity = None
    if row.capacity_display_enabled and row.capacity_limit is not None:
        used = db.scalar(
            select(func.count(WebsitePromotionApplication.id)).where(
                WebsitePromotionApplication.status.notin_(["rejected", "duplicate", "spam"])
            )
        ) or 0
        capacity_limit = row.capacity_limit
        remaining_capacity = max(row.capacity_limit - used, 0)

    return PromotionStatusPublic(
        promotion_status=status,
        headline=row.headline,
        description=row.description,
        application_enabled=open_for_applications,
        whatsapp_enabled=row.whatsapp_enabled,
        portfolio_permission_required=row.portfolio_permission_required,
        start_date=row.start_date,
        end_date=row.end_date,
        capacity_limit=capacity_limit,
        remaining_capacity=remaining_capacity,
        terms_summary=row.terms_text,
        maintenance_message=row.maintenance_message,
        business_name=settings.business_name,
    )


@router.post("/applications", response_model=ApplicationCreated, status_code=201)
def create_application(
    payload: ApplicationCreate, request: Request, db: Session = Depends(get_db)
):
    promo = get_promo_settings(db)
    _, open_for_applications = effective_status(promo, datetime.utcnow())
    if not open_for_applications:
        raise HTTPException(
            status_code=403,
            detail="Applications are not being accepted at the moment. Please check back later.",
        )

    client_ip = request.client.host if request.client else "unknown"
    if not rate_limiter.allow(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many submissions from this connection. Please try again later.",
        )

    is_spam = bool(payload.company_website.strip())  # honeypot filled -> bot

    if not is_spam:
        cutoff = datetime.utcnow() - timedelta(hours=settings.duplicate_window_hours)
        duplicate = db.scalar(
            select(WebsitePromotionApplication.id)
            .where(
                or_(
                    WebsitePromotionApplication.mobile_number == payload.mobile_number,
                    WebsitePromotionApplication.email == str(payload.email).lower(),
                ),
                WebsitePromotionApplication.created_at >= cutoff,
                WebsitePromotionApplication.status != "spam",
            )
            .limit(1)
        )
        if duplicate:
            raise HTTPException(
                status_code=409,
                detail=(
                    "An application with this mobile number or email address was already "
                    "submitted recently. Our team will contact you regarding it."
                ),
            )

    reference = generate_reference_number()
    data = payload.model_dump(
        exclude={"company_website", "information_correct", "no_guarantee_understood"}
    )
    data["email"] = str(payload.email).lower()
    application = WebsitePromotionApplication(
        reference_number=reference,
        status="spam" if is_spam else "new",
        **data,
    )
    db.add(application)
    db.commit()

    # Log the event without full personal data.
    logger.info("Application %s received (category=%s, city=%s)", reference, payload.business_category, payload.city)

    return ApplicationCreated(
        reference_number=reference,
        status="new",
        submitted_at=application.created_at,
        message=SUCCESS_MESSAGE,
    )


@router.get("/demos", response_model=list[DemoPublic])
def list_demos(db: Session = Depends(get_db)):
    rows = db.scalars(
        select(DemoWebsite)
        .where(DemoWebsite.is_active.is_(True))
        .order_by(DemoWebsite.sort_order, DemoWebsite.id)
    ).all()
    return [
        DemoPublic(
            id=r.id,
            category=r.category,
            title=r.title,
            description=r.description,
            features=[f.strip() for f in r.features.split(",") if f.strip()],
            demo_url=r.demo_url,
            image_url=r.image_url,
        )
        for r in rows
    ]
