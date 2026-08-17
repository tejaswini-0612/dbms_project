from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import app.models as models
import app.schemas as schemas
from app.database import get_db

router = APIRouter(prefix="/service-types", tags=["service_types"])

@router.get("/", response_model=List[schemas.ServiceTypeOut])
async def get_service_types(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ServiceType))
    return result.scalars().all()
