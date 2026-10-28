from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import ProductCreate, ProductOut

from .router import router


@router.post("", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
