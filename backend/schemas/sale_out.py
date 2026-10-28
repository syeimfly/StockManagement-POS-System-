from datetime import datetime

from pydantic import BaseModel, ConfigDict

from .sale_item_out import SaleItemOut


class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    total_price: float
    created_at: datetime
    items: list[SaleItemOut]
