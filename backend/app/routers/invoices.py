from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
import app.models as models
import app.schemas as schemas
from app.database import get_db

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.get("/{request_id}", response_model=schemas.InvoiceOut)
async def get_invoice(request_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Invoice).where(models.Invoice.request_id == request_id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found for this request")
    return invoice

@router.post("/{invoice_id}/pay")
async def pay_invoice(
    invoice_id: int,
    payment_data: schemas.PaymentCreate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Invoice).where(models.Invoice.invoice_id == invoice_id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == 'Paid':
        raise HTTPException(status_code=400, detail="Invoice is already paid")

    try:
        await db.execute(
            text("CALL sp_record_payment(:invoice_id, :amount, :method::payment_method)"),
            {
                "invoice_id": invoice_id,
                "amount": payment_data.amount,
                "method": payment_data.method.value
            }
        )
        await db.commit()
        return {"message": "Payment recorded successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
