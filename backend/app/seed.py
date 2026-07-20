from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import DemoWebsite, WebsitePromotionSettings

DEFAULT_DEMOS = [
    {
        "category": "consultant",
        "title": "Consultant / CA Website",
        "description": "A credibility-focused site for consultants and chartered accountants with services, credentials and enquiry flow.",
        "features": "Service pages, Team profiles, Enquiry form, Testimonial-ready layout",
        "sort_order": 1,
    },
    {
        "category": "clinic",
        "title": "Clinic / Doctor Website",
        "description": "A calm, trustworthy layout for clinics with treatments, timings, location map and appointment enquiry.",
        "features": "Treatment list, Clinic timings, Google Maps, Appointment enquiry",
        "sort_order": 2,
    },
    {
        "category": "local-business",
        "title": "Local Business Website",
        "description": "A clean profile site for shops and local services with product highlights and directions.",
        "features": "Product highlights, Photo gallery, WhatsApp chat, Directions",
        "sort_order": 3,
    },
    {
        "category": "restaurant",
        "title": "Restaurant / Café Website",
        "description": "An appetising showcase with menu sections, gallery, location and table enquiry.",
        "features": "Menu display, Photo gallery, Location map, Contact form",
        "sort_order": 4,
    },
    {
        "category": "education",
        "title": "Coaching / Education Website",
        "description": "A structured site for institutes with courses, batches, faculty and admission enquiries.",
        "features": "Course pages, Batch details, Faculty section, Admission enquiry",
        "sort_order": 5,
    },
    {
        "category": "professional-services",
        "title": "Professional Services Website",
        "description": "A versatile corporate layout for agencies, contractors and B2B service providers.",
        "features": "Service catalogue, Project highlights, Team section, Quote request",
        "sort_order": 6,
    },
]


def seed_defaults(db: Session) -> None:
    if db.get(WebsitePromotionSettings, 1) is None:
        db.add(WebsitePromotionSettings(id=1))
    if db.scalar(select(DemoWebsite.id).limit(1)) is None:
        for demo in DEFAULT_DEMOS:
            db.add(DemoWebsite(**demo))
    db.commit()
