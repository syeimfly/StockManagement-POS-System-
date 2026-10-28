import io

from fastapi import Depends, HTTPException
from fastapi.responses import StreamingResponse
from fpdf import FPDF
from sqlalchemy.orm import Session

from database import get_db
from models import Sale

from .router import router


@router.get("/{sale_id}/receipt")
def get_receipt(sale_id: int, db: Session = Depends(get_db)):
    sale = db.get(Sale, sale_id)
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Receipt", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 8, f"Sale #{sale.id}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, f"Date: {sale.created_at:%Y-%m-%d %H:%M}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    for item in sale.items:
        line_total = item.price_at_sale * item.quantity
        pdf.cell(
            0, 8,
            f"{item.product.name} x{item.quantity} @ {item.price_at_sale} = {line_total}",
            new_x="LMARGIN", new_y="NEXT",
        )

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, f"Total: {sale.total_price}", new_x="LMARGIN", new_y="NEXT")

    buffer = io.BytesIO(pdf.output())
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=receipt-{sale.id}.pdf"},
    )
