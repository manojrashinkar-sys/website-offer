import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from .models import APPLICATION_STATUSES, PROMOTION_STATUSES

INDIAN_MOBILE_RE = re.compile(r"^(?:\+?91[\-\s]?)?([6-9]\d{9})$")
URL_RE = re.compile(r"^https?://[^\s<>\"]+$", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]*>")


def strip_html(value: str) -> str:
    return TAG_RE.sub("", value).strip()


def normalise_indian_mobile(value: str) -> str:
    match = INDIAN_MOBILE_RE.match(value.strip().replace(" ", ""))
    if not match:
        raise ValueError("Enter a valid 10-digit Indian mobile number.")
    return match.group(1)


class ApplicationCreate(BaseModel):
    owner_name: str = Field(min_length=2, max_length=120)
    business_name: str = Field(min_length=2, max_length=160)
    mobile_number: str
    whatsapp_number: str
    email: EmailStr
    business_category: str = Field(min_length=2, max_length=80)
    city: str = Field(min_length=2, max_length=80)
    state: str = Field(min_length=2, max_length=80)
    business_description: str = Field(min_length=20, max_length=4000)
    services_offered: str = Field(min_length=3, max_length=4000)
    existing_website_url: str = ""
    social_media_links: str = ""
    required_pages: str = ""
    website_objective: str = Field(default="", max_length=200)
    preferred_contact_method: str = "whatsapp"
    preferred_contact_time: str = Field(default="", max_length=60)
    expected_launch_timeline: str = Field(default="", max_length=60)
    budget_range: str = Field(default="", max_length=60)
    has_domain: bool = False
    has_hosting: bool = False
    has_logo: bool = False
    content_ready: bool = False
    images_ready: bool = False
    additional_requirements: str = Field(default="", max_length=4000)
    portfolio_permission: bool = False
    information_correct: bool
    no_guarantee_understood: bool
    consent_to_contact: bool
    privacy_policy_accepted: bool
    # Honeypot: hidden field real users never fill. Named to look attractive to bots.
    company_website: str = ""
    source: str = Field(default="promo_page", max_length=60)

    @field_validator(
        "owner_name", "business_name", "business_category", "city", "state",
        "business_description", "services_offered", "required_pages",
        "website_objective", "preferred_contact_time", "expected_launch_timeline",
        "budget_range", "additional_requirements", "social_media_links", "source",
    )
    @classmethod
    def sanitise_text(cls, v: str) -> str:
        return strip_html(v)

    @field_validator("mobile_number", "whatsapp_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        return normalise_indian_mobile(v)

    @field_validator("existing_website_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if v and not URL_RE.match(v):
            raise ValueError("Enter a valid URL starting with http:// or https://")
        return v[:500]

    @field_validator("information_correct", "no_guarantee_understood", "consent_to_contact", "privacy_policy_accepted")
    @classmethod
    def must_be_accepted(cls, v: bool) -> bool:
        if not v:
            raise ValueError("This confirmation is required.")
        return v

    @field_validator("preferred_contact_method")
    @classmethod
    def validate_contact_method(cls, v: str) -> str:
        allowed = {"whatsapp", "phone", "email"}
        v = v.strip().lower()
        if v not in allowed:
            raise ValueError("Preferred contact method must be whatsapp, phone or email.")
        return v


class EnquiryCreate(BaseModel):
    """Payload of the public enquiry form (POST /api/website-enquiry)."""

    full_name: str = Field(min_length=2, max_length=120)
    business_name: str = Field(min_length=2, max_length=160)
    mobile_number: str
    whatsapp_number: str
    email: EmailStr
    business_category: str = Field(min_length=2, max_length=80)
    city: str = Field(min_length=2, max_length=80)
    business_description: str = Field(min_length=20, max_length=4000)
    required_features: str = Field(default="", max_length=4000)
    existing_website_url: str = ""
    additional_requirements: str = Field(default="", max_length=4000)
    company_website: str = ""  # honeypot — hidden field real users never fill
    source: str = Field(default="promo_page", max_length=60)

    @field_validator(
        "full_name", "business_name", "business_category", "city",
        "business_description", "required_features", "additional_requirements", "source",
    )
    @classmethod
    def sanitise_text(cls, v: str) -> str:
        return strip_html(v)

    @field_validator("mobile_number", "whatsapp_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        return normalise_indian_mobile(v)

    @field_validator("existing_website_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if v and not URL_RE.match(v):
            raise ValueError("Enter a valid URL starting with http:// or https://")
        return v[:500]


class ApplicationCreated(BaseModel):
    reference_number: str
    status: str
    submitted_at: datetime
    message: str


class PromotionStatusPublic(BaseModel):
    promotion_status: str
    headline: str
    description: str
    application_enabled: bool
    whatsapp_enabled: bool
    portfolio_permission_required: bool
    start_date: datetime | None = None
    end_date: datetime | None = None
    capacity_limit: int | None = None
    remaining_capacity: int | None = None
    terms_summary: str
    maintenance_message: str = ""
    business_name: str


class DemoPublic(BaseModel):
    id: int
    category: str
    title: str
    description: str
    features: list[str]
    demo_url: str
    image_url: str


class ApplicationAdmin(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    reference_number: str
    owner_name: str
    business_name: str
    mobile_number: str
    whatsapp_number: str
    email: str
    business_category: str
    city: str
    state: str
    business_description: str
    services_offered: str
    existing_website_url: str
    social_media_links: str
    required_pages: str
    website_objective: str
    preferred_contact_method: str
    preferred_contact_time: str
    expected_launch_timeline: str
    budget_range: str
    has_domain: bool
    has_hosting: bool
    has_logo: bool
    content_ready: bool
    images_ready: bool
    additional_requirements: str
    portfolio_permission: bool
    consent_to_contact: bool
    privacy_policy_accepted: bool
    source: str
    status: str
    priority: str
    admin_notes: str
    assigned_to: str
    created_at: datetime
    updated_at: datetime
    contacted_at: datetime | None
    selected_at: datetime | None
    completed_at: datetime | None


class ApplicationListResponse(BaseModel):
    items: list[ApplicationAdmin]
    total: int
    page: int
    page_size: int
    stats: dict[str, int]


class ApplicationPatch(BaseModel):
    status: str | None = None
    priority: str | None = None
    admin_notes: str | None = None
    assigned_to: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is not None and v not in APPLICATION_STATUSES:
            raise ValueError(f"Invalid status. Allowed: {', '.join(APPLICATION_STATUSES)}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str | None) -> str | None:
        if v is not None and v not in {"low", "normal", "high"}:
            raise ValueError("Priority must be low, normal or high.")
        return v


class SettingsPatch(BaseModel):
    promotion_enabled: bool | None = None
    application_enabled: bool | None = None
    whatsapp_enabled: bool | None = None
    promotion_status: str | None = None
    headline: str | None = Field(default=None, max_length=200)
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    capacity_limit: int | None = Field(default=None, ge=0)
    capacity_display_enabled: bool | None = None
    portfolio_permission_required: bool | None = None
    terms_text: str | None = None
    maintenance_message: str | None = None

    @field_validator("promotion_status")
    @classmethod
    def validate_promotion_status(cls, v: str | None) -> str | None:
        if v is not None and v not in PROMOTION_STATUSES:
            raise ValueError(f"Invalid status. Allowed: {', '.join(PROMOTION_STATUSES)}")
        return v


class SettingsAdmin(BaseModel):
    model_config = {"from_attributes": True}

    promotion_enabled: bool
    application_enabled: bool
    whatsapp_enabled: bool
    promotion_status: str
    headline: str
    description: str
    start_date: datetime | None
    end_date: datetime | None
    capacity_limit: int | None
    capacity_display_enabled: bool
    portfolio_permission_required: bool
    terms_text: str
    maintenance_message: str
    updated_at: datetime
