from datetime import datetime, timezone

from fastapi import Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Product, Sale
from schemas import DashboardOut

from .router import router

LOW_STOCK_THRESHOLD = 5


@router.get("", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    today = datetime.now(timezone.utc).date()

    today_sales_count, today_revenue = db.query(
        func.count(Sale.id),
        func.coalesce(func.sum(Sale.total_price), 0),
    ).filter(func.date(Sale.created_at) == today).one()

    total_products = db.query(func.count(Product.id)).scalar()

    low_stock_products = (
        db.query(Product)
        .filter(Product.stock_quantity <= LOW_STOCK_THRESHOLD)
        .all()
    )

    return DashboardOut(
        today_sales_count=today_sales_count,
        today_revenue=float(today_revenue),
        total_products=total_products,
        low_stock_count=len(low_stock_products),
        low_stock_products=low_stock_products,
    )
