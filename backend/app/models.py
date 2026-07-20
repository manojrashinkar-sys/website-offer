from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base

APPLICATION_STATUSES = [
    "new",
    "under_review",
    "contacted",
    "qualified",
    "consultation_scheduled",
    "selected",
    "proposal_sent",
    "development_started",
    "awaiting_content",
    "awaiting_feedback",
    "completed",
    "on_hold",
    "rejected",
    "duplicate",
    "spam",
]

PROMOTION_STATUSES = [
    "applications_open",
    "limited_availability",
    "applications_under_review",
    "applications_temporarily_closed",
    "offer_ended",
]


class WebsitePromotionApplication(Base):
    __tablename__ = "website_promotion_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reference_number: Mapped[str] = mapped_column(String(24), unique=True, index=True)

    owner_name: Mapped[str] = mapped_column(String(120))
    business_name: Mapped[str] = mapped_column(String(160))
    mobile_number: Mapped[str] = mapped_column(String(16), index=True)
    whatsapp_number: Mapped[str] = mapped_column(String(16))
    email: Mapped[str] = mapped_column(String(254), index=True)
    business_category: Mapped[str] = mapped_column(String(80))
    city: Mapped[str] = mapped_column(String(80))
    state: Mapped[str] = mapped_column(String(80))

    business_description: Mapped[str] = mapped_column(Text)
    services_offered: Mapped[str] = mapped_column(Text)
    existing_website_url: Mapped[str] = mapped_column(String(500), default="")
    social_media_links: Mapped[str] = mapped_column(Text, default="")
    required_pages: Mapped[str] = mapped_column(Text, default="")
    website_objective: Mapped[str] = mapped_column(String(200), default="")
    preferred_contact_method: Mapped[str] = mapped_column(String(30), default="whatsapp")
    preferred_contact_time: Mapped[str] = mapped_column(String(60), default="")
    expected_launch_timeline: Mapped[str] = mapped_column(String(60), default="")
    budget_range: Mapped[str] = mapped_column(String(60), default="")

    has_domain: Mapped[bool] = mapped_column(Boolean, default=False)
    has_hosting: Mapped[bool] = mapped_column(Boolean, default=False)
    has_logo: Mapped[bool] = mapped_column(Boolean, default=False)
    content_ready: Mapped[bool] = mapped_column(Boolean, default=False)
    images_ready: Mapped[bool] = mapped_column(Boolean, default=False)

    additional_requirements: Mapped[str] = mapped_column(Text, default="")
    portfolio_permission: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_to_contact: Mapped[bool] = mapped_column(Boolean, default=False)
    privacy_policy_accepted: Mapped[bool] = mapped_column(Boolean, default=False)

    source: Mapped[str] = mapped_column(String(60), default="promo_page")
    status: Mapped[str] = mapped_column(String(30), default="new", index=True)
    priority: Mapped[str] = mapped_column(String(10), default="normal")
    admin_notes: Mapped[str] = mapped_column(Text, default="")
    assigned_to: Mapped[str] = mapped_column(String(80), default="")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    contacted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    selected_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class WebsitePromotionSettings(Base):
    __tablename__ = "website_promotion_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    promotion_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    application_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    whatsapp_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    promotion_status: Mapped[str] = mapped_column(String(40), default="applications_open")
    headline: Mapped[str] = mapped_column(String(200), default="Introductory Website Development Programme")
    description: Mapped[str] = mapped_column(
        Text,
        default=(
            "We are currently reviewing applications from businesses that can benefit "
            "from a professional online presence. Selected businesses may qualify for "
            "reduced or waived development charges during our introductory programme."
        ),
    )
    start_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    capacity_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    capacity_display_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    portfolio_permission_required: Mapped[bool] = mapped_column(Boolean, default=False)
    terms_text: Mapped[str] = mapped_column(
        Text,
        default=(
            "Application submission does not guarantee selection. Domain, hosting and "
            "third-party service costs may be charged separately. Project scope is "
            "confirmed before development starts. Any promotional concession is "
            "confirmed only through a written proposal."
        ),
    )
    maintenance_message: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DemoWebsite(Base):
    __tablename__ = "website_promotion_demos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(80))
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    features: Mapped[str] = mapped_column(Text, default="")  # comma-separated
    demo_url: Mapped[str] = mapped_column(String(500), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
