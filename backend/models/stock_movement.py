from datetime import datetime
import enum

from sqlalchemy import Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from database import Base


class MovementDirection(str, enum.Enum):
    IN = "in"
    OUT = "out"


class MovementReason(str, enum.Enum):
    SALE = "sale"
    RESTOCK = "restock"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity_before: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity_after: Mapped[int] = mapped_column(Integer, nullable=False)
    direction: Mapped[MovementDirection] = mapped_column(Enum(MovementDirection), nullable=False)
    reason: Mapped[MovementReason] = mapped_column(Enum(MovementReason), nullable=False)
    sale_id: Mapped[int | None] = mapped_column(ForeignKey("sales.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product: Mapped["Product"] = relationship()

    @property
    def product_name(self) -> str:
        return self.product.name
