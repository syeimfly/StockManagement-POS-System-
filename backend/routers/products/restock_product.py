from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Product, StockMovement, MovementDirection, MovementReason
from schemas import RestockRequest, ProductOut

from .router import router


@router.post("/{product_id}/restock", response_model=ProductOut)
def restock_product(product_id: int, payload: RestockRequest, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    before = product.stock_quantity
    product.stock_quantity += payload.quantity
    db.add(StockMovement(
        product_id=product.id,
        quantity=payload.quantity,
        quantity_before=before,
        quantity_after=product.stock_quantity,
        direction=MovementDirection.IN,
        reason=MovementReason.RESTOCK,
    ))
    db.commit()
    db.refresh(product)
    return product
