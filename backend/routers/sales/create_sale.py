from collections import defaultdict

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import (
    Product,
    Sale,
    SaleItem,
    StockMovement,
    MovementDirection,
    MovementReason,
)
from schemas import SaleCreate, SaleOut

from .router import router


@router.post("", response_model=SaleOut, status_code=201)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Sale must include at least one item")

    requested = defaultdict(int)
    for item in payload.items:
        requested[item.product_id] += item.quantity

    products = {}
    for product_id, qty in requested.items():
        product = db.get(Product, product_id)
        if product is None:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        if product.stock_quantity < qty:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Not enough stock for '{product.name}' "
                    f"(have {product.stock_quantity}, need {qty})"
                ),
            )
        products[product_id] = product

    sale = Sale(total_price=0)
    db.add(sale)
    db.flush()

    total = 0
    for item in payload.items:
        product = products[item.product_id]
        before = product.stock_quantity
        product.stock_quantity -= item.quantity
        total += product.price * item.quantity

        db.add(SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            quantity=item.quantity,
            price_at_sale=product.price,
        ))
        db.add(StockMovement(
            product_id=product.id,
            quantity=item.quantity,
            quantity_before=before,
            quantity_after=product.stock_quantity,
            direction=MovementDirection.OUT,
            reason=MovementReason.SALE,
            sale_id=sale.id,
        ))

    sale.total_price = total
    db.commit()
    db.refresh(sale)
    return sale
