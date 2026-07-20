import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models import WebsitePromotionApplication
from ..schemas import ApplicationCreated, EnquiryCreate
from ..utils import generate_reference_number
from .promotion import SUCCESS_MESSAGE, rate_limiter

logger = logging.getLogger("website_promotion")
settings = get_settings()
router = APIRouter(tags=["website-enquiry"])


@router.post("/api/website-enquiry", response_model=ApplicationCreated, status_code=201)
def create_enquiry(payload: EnquiryCreate, request: Request, db: Session = Depends(get_db)):
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
                    "An enquiry with this mobile number or email address was already "
                    "submitted recently. Our team will contact you regarding it."
                ),
            )

    reference = generate_reference_number()
    enquiry = WebsitePromotionApplication(
        reference_number=reference,
        owner_name=payload.full_name,
        business_name=payload.business_name,
        mobile_number=payload.mobile_number,
        whatsapp_number=payload.whatsapp_number,
        email=str(payload.email).lower(),
        business_category=payload.business_category,
        city=payload.city,
        state="",
        business_description=payload.business_description,
        services_offered=payload.required_features,
        existing_website_url=payload.existing_website_url,
        additional_requirements=payload.additional_requirements,
        source=payload.source,
        status="spam" if is_spam else "new",
    )
    db.add(enquiry)
    db.commit()

    # Log the event without full personal data.
    logger.info("Enquiry %s received (category=%s, city=%s)", reference, payload.business_category, payload.city)

    return ApplicationCreated(
        reference_number=reference,
        status="new",
        submitted_at=enquiry.created_at,
        message=SUCCESS_MESSAGE,
    )
