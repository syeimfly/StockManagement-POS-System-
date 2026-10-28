from pydantic import BaseModel


class ProductUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    barcode: str | None = None
    category: str | None = None
