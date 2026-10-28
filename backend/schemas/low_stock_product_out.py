from pydantic import BaseModel, ConfigDict


class LowStockProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    stock_quantity: int
    barcode: str
    category: str
