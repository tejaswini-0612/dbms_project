from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from typing import Optional
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

@router.post("/{invoice_id}/pay", response_model=schemas.InvoiceOut)
async def pay_invoice(
    invoice_id: int,
    payment_data: Optional[schemas.PaymentCreate] = None,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Invoice).where(models.Invoice.invoice_id == invoice_id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == 'Paid':
        raise HTTPException(status_code=400, detail="Invoice is already paid")

    payment = payment_data or schemas.PaymentCreate()
    amount = payment.amount if payment.amount is not None else invoice.total_amount

    try:
        await db.execute(
            # CAST(...) rather than ::payment_method — SQLAlchemy reads "::" as an
            # escaped colon and would not bind :method at all.
            text("CALL sp_record_payment(:invoice_id, :amount, CAST(:method AS payment_method))"),
            {
                "invoice_id": invoice_id,
                "amount": amount,
                "method": payment.method.value
            }
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    await db.refresh(invoice)
    return invoice
