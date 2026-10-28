from pydantic import BaseModel

from .sale_item_create import SaleItemCreate


class SaleCreate(BaseModel):
    items: list[SaleItemCreate]
