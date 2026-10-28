from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import get_db
from routers.products import router as products_router
from routers.sales import router as sales_router
from routers.history import router as history_router
from routers.dashboard import router as dashboard_router

app = FastAPI(title="Stock Management + POS")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(products_router)
app.include_router(sales_router)
app.include_router(history_router)
app.include_router(dashboard_router)

@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}
