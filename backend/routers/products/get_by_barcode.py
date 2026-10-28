from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import ProductOut

from .router import router


@router.get("/barcode/{code}", response_model=ProductOut)
def get_by_barcode(code: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.barcode == code).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
