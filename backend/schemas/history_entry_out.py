from datetime import datetime

from pydantic import BaseModel, ConfigDict

from models import MovementDirection, MovementReason


class HistoryEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    quantity: int
    quantity_before: int
    quantity_after: int
    direction: MovementDirection
    reason: MovementReason
    sale_id: int | None
    created_at: datetime
