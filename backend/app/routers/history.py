from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import List
import app.schemas as schemas
from app.database import get_db

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/customer", response_model=List[schemas.ServiceHistoryOut])
async def get_customer_history(customer_id: int = 1, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM service_history WHERE customer_id = :user_id ORDER BY requested_at DESC"),
        {"user_id": customer_id}
    )
    return result.mappings().all()

@router.get("/mechanic", response_model=List[schemas.ServiceHistoryOut])
async def get_mechanic_history(mechanic_id: int = 1, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM service_history WHERE mechanic_name = (SELECT name FROM mechanic WHERE mechanic_id = :mid) ORDER BY requested_at DESC"),
        {"mid": mechanic_id}
    )
    return result.mappings().all()
