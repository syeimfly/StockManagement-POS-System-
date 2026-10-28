from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Sale
from schemas import SaleOut

from .router import router


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.get(Sale, sale_id)
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
