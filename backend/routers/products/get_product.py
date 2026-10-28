from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import ProductOut

from .router import router


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
