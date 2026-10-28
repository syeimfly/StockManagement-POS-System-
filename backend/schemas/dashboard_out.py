from pydantic import BaseModel

from .low_stock_product_out import LowStockProductOut


class DashboardOut(BaseModel):
    today_sales_count: int
    today_revenue: float
    total_products: int
    low_stock_count: int
    low_stock_products: list[LowStockProductOut]
