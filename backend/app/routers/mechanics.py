from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import app.models as models
import app.schemas as schemas
from app.database import get_db

router = APIRouter(prefix="/mechanics", tags=["mechanics"])

@router.get("/", response_model=List[schemas.MechanicOut])
async def get_mechanics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Mechanic))
    return result.scalars().all()
