from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import app.models as models
import app.schemas as schemas
from app.database import get_db

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.get("/", response_model=List[schemas.VehicleOut])
async def get_vehicles(customer_id: int = 1, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Vehicle).where(models.Vehicle.customer_id == customer_id))
    return result.scalars().all()

@router.post("/", response_model=schemas.VehicleOut, status_code=status.HTTP_201_CREATED)
async def add_vehicle(vehicle: schemas.VehicleCreate, customer_id: int = 1, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(models.Vehicle).where(models.Vehicle.registration_number == vehicle.registration_number))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists")

    new_vehicle = models.Vehicle(
        customer_id=customer_id,
        registration_number=vehicle.registration_number,
        make=vehicle.make,
        model=vehicle.model,
        year=vehicle.year
    )
    db.add(new_vehicle)
    await db.commit()
    await db.refresh(new_vehicle)
    return new_vehicle
