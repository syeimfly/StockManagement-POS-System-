from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    price: float
    barcode: str
    category: str
    stock_quantity: int = 0
