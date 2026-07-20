import csv
import io
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..models import APPLICATION_STATUSES, WebsitePromotionApplication
from ..schemas import (
    ApplicationAdmin,
    ApplicationListResponse,
    ApplicationPatch,
    SettingsAdmin,
    SettingsPatch,
)
from .promotion import get_promo_settings

settings = get_settings()
router = APIRouter(prefix="/api/admin/website-promotion", tags=["website-promotion-admin"])


def require_admin(x_admin_token: str = Header(default="")) -> None:
    """Token-based guard for standalone use.

    INTEGRATION NOTE: when merging into the hosted portal, replace this
    dependency with the portal's existing authentication dependency
    (e.g. `Depends(get_current_admin_user)`) and delete the token check.
    """
    if not settings.admin_api_token:
        raise HTTPException(status_code=503, detail="Admin API is not configured (ADMIN_API_TOKEN unset).")
    if not secrets.compare_digest(x_admin_token, settings.admin_api_token):
        raise HTTPException(status_code=401, detail="Invalid admin credentials.")


def _filtered_query(
    q: str | None,
    status: str | None,
    category: str | None,
    city: str | None,
    date_from: datetime | None,
    date_to: datetime | None,
):
    stmt = select(WebsitePromotionApplication)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                WebsitePromotionApplication.owner_name.ilike(like),
                WebsitePromotionApplication.business_name.ilike(like),
                WebsitePromotionApplication.email.ilike(like),
                WebsitePromotionApplication.mobile_number.ilike(like),
                WebsitePromotionApplication.reference_number.ilike(like),
            )
        )
    if status:
        stmt = stmt.where(WebsitePromotionApplication.status == status)
    if category:
        stmt = stmt.where(WebsitePromotionApplication.business_category.ilike(f"%{category}%"))
    if city:
        stmt = stmt.where(WebsitePromotionApplication.city.ilike(f"%{city}%"))
    if date_from:
        stmt = stmt.where(WebsitePromotionApplication.created_at >= date_from)
    if date_to:
        stmt = stmt.where(WebsitePromotionApplication.created_at <= date_to)
    return stmt


@router.get("/applications", response_model=ApplicationListResponse, dependencies=[Depends(require_admin)])
def list_applications(
    db: Session = Depends(get_db),
    q: str | None = None,
    status: str | None = None,
    category: str | None = None,
    city: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    sort: str = Query("newest", pattern="^(newest|oldest)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    stmt = _filtered_query(q, status, category, city, date_from, date_to)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    order = (
        WebsitePromotionApplication.created_at.desc()
        if sort == "newest"
        else WebsitePromotionApplication.created_at.asc()
    )
    rows = db.scalars(stmt.order_by(order).offset((page - 1) * page_size).limit(page_size)).all()

    stats_rows = db.execute(
        select(WebsitePromotionApplication.status, func.count(WebsitePromotionApplication.id))
        .group_by(WebsitePromotionApplication.status)
    ).all()
    stats = {s: 0 for s in APPLICATION_STATUSES}
    stats.update({row[0]: row[1] for row in stats_rows})
    stats["total"] = sum(v for k, v in stats.items() if k in APPLICATION_STATUSES)

    return ApplicationListResponse(
        items=[ApplicationAdmin.model_validate(r) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
        stats=stats,
    )


@router.get("/applications/export", dependencies=[Depends(require_admin)])
def export_applications_csv(
    db: Session = Depends(get_db),
    q: str | None = None,
    status: str | None = None,
    category: str | None = None,
    city: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
):
    stmt = _filtered_query(q, status, category, city, date_from, date_to)
    rows = db.scalars(stmt.order_by(WebsitePromotionApplication.created_at.desc())).all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    header = [
        "reference_number", "created_at", "status", "priority", "owner_name",
        "business_name", "business_category", "city", "state", "mobile_number",
        "whatsapp_number", "email", "budget_range", "expected_launch_timeline",
        "preferred_contact_method", "assigned_to",
    ]
    writer.writerow(header)
    for r in rows:
        writer.writerow([
            r.reference_number, r.created_at.isoformat(), r.status, r.priority,
            r.owner_name, r.business_name, r.business_category, r.city, r.state,
            r.mobile_number, r.whatsapp_number, r.email, r.budget_range,
            r.expected_launch_timeline, r.preferred_contact_method, r.assigned_to,
        ])
    buffer.seek(0)
    filename = f"website-leads-{datetime.utcnow():%Y%m%d-%H%M}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/applications/{application_id}", response_model=ApplicationAdmin, dependencies=[Depends(require_admin)])
def get_application(application_id: int, db: Session = Depends(get_db)):
    row = db.get(WebsitePromotionApplication, application_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Application not found.")
    return ApplicationAdmin.model_validate(row)


@router.patch("/applications/{application_id}", response_model=ApplicationAdmin, dependencies=[Depends(require_admin)])
def update_application(application_id: int, payload: ApplicationPatch, db: Session = Depends(get_db)):
    row = db.get(WebsitePromotionApplication, application_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Application not found.")

    changes = payload.model_dump(exclude_unset=True)
    now = datetime.utcnow()
    new_status = changes.get("status")
    if new_status and new_status != row.status:
        if new_status == "contacted" and row.contacted_at is None:
            row.contacted_at = now
        elif new_status == "selected" and row.selected_at is None:
            row.selected_at = now
        elif new_status == "completed" and row.completed_at is None:
            row.completed_at = now
    for field, value in changes.items():
        setattr(row, field, value)
    db.commit()
    return ApplicationAdmin.model_validate(row)


@router.get("/settings", response_model=SettingsAdmin, dependencies=[Depends(require_admin)])
def read_settings(db: Session = Depends(get_db)):
    return SettingsAdmin.model_validate(get_promo_settings(db))


@router.patch("/settings", response_model=SettingsAdmin, dependencies=[Depends(require_admin)])
def update_settings(payload: SettingsPatch, db: Session = Depends(get_db)):
    row = get_promo_settings(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    return SettingsAdmin.model_validate(row)
