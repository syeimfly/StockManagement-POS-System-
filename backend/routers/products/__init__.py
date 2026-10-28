from .router import router
from . import (
    list_products,
    get_product,
    get_by_barcode,
    create_product,
    update_product,
    delete_product,
    restock_product,
)

__all__ = ["router"]
