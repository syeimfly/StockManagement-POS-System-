from datetime import date as date_type

from fastapi import Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import StockMovement, MovementReason
from schemas import HistoryEntryOut

from .router import router


@router.get("", response_model=list[HistoryEntryOut])
def list_history(
    product_id: int | None = None,
    reason: MovementReason | None = None,
    date: date_type | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(StockMovement)
    if product_id is not None:
        query = query.filter(StockMovement.product_id == product_id)
    if reason is not None:
        query = query.filter(StockMovement.reason == reason)
    if date is not None:
        query = query.filter(func.date(StockMovement.created_at) == date)
    return query.order_by(StockMovement.created_at.desc()).all()
