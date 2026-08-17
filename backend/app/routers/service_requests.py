from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from sqlalchemy.orm import selectinload
from typing import List
import app.models as models
import app.schemas as schemas
from app.database import get_db

router = APIRouter(prefix="/service-requests", tags=["service_requests"])


def _enrich(req: models.ServiceRequest) -> schemas.ServiceRequestOut:
    """Map ORM object + relationships to the output schema."""
    return schemas.ServiceRequestOut(
        request_id=req.request_id,
        vehicle_id=req.vehicle_id,
        service_type_id=req.service_type_id,
        mechanic_id=req.mechanic_id,
        status=req.status,
        requested_at=req.requested_at,
        updated_at=req.updated_at,
        completed_at=req.completed_at,
        closed_reason=req.closed_reason,
        registration_number=req.vehicle.registration_number if req.vehicle else None,
        service_name=req.service_type.name if req.service_type else None,
        mechanic_name=req.mechanic.name if req.mechanic else None,
    )


@router.post("/", response_model=schemas.ServiceRequestOut, status_code=status.HTTP_201_CREATED)
async def create_service_request(
    request_data: schemas.ServiceRequestCreate,
    customer_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    # Verify vehicle belongs to the customer
    vehicle_result = await db.execute(select(models.Vehicle).where(
        models.Vehicle.vehicle_id == request_data.vehicle_id,
        models.Vehicle.customer_id == customer_id
    ))
    if not vehicle_result.scalars().first():
        raise HTTPException(status_code=403, detail="Vehicle not found or doesn't belong to you")

    new_request = models.ServiceRequest(
        vehicle_id=request_data.vehicle_id,
        service_type_id=request_data.service_type_id,
        mechanic_id=request_data.mechanic_id
    )
    db.add(new_request)
    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(models.ServiceRequest)
        .options(
            selectinload(models.ServiceRequest.vehicle),
            selectinload(models.ServiceRequest.service_type),
            selectinload(models.ServiceRequest.mechanic),
        )
        .where(models.ServiceRequest.request_id == new_request.request_id)
    )
    loaded = result.scalars().first()
    return _enrich(loaded)


@router.get("/mine", response_model=List[schemas.ServiceRequestOut])
async def get_my_service_requests(customer_id: int = 1, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ServiceRequest)
        .options(
            selectinload(models.ServiceRequest.vehicle),
            selectinload(models.ServiceRequest.service_type),
            selectinload(models.ServiceRequest.mechanic),
        )
        .join(models.Vehicle)
        .where(models.Vehicle.customer_id == customer_id)
        .order_by(models.ServiceRequest.requested_at.desc())
    )
    return [_enrich(r) for r in result.scalars().all()]


@router.get("/pending", response_model=List[schemas.ServiceRequestOut])
async def get_pending_requests(db: AsyncSession = Depends(get_db)):
    """Returns all Pending requests with no mechanic assigned yet."""
    result = await db.execute(
        select(models.ServiceRequest)
        .options(
            selectinload(models.ServiceRequest.vehicle),
            selectinload(models.ServiceRequest.service_type),
            selectinload(models.ServiceRequest.mechanic),
        )
        .where(models.ServiceRequest.status == 'Pending')
        .where(models.ServiceRequest.mechanic_id == None)
        .order_by(models.ServiceRequest.requested_at.desc())
    )
    return [_enrich(r) for r in result.scalars().all()]


@router.get("/assigned", response_model=List[schemas.ServiceRequestOut])
async def get_assigned_requests(mechanic_id: int = 1, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.ServiceRequest)
        .options(
            selectinload(models.ServiceRequest.vehicle),
            selectinload(models.ServiceRequest.service_type),
            selectinload(models.ServiceRequest.mechanic),
        )
        .where(models.ServiceRequest.mechanic_id == mechanic_id)
        .where(models.ServiceRequest.status != 'Closed')
        .order_by(models.ServiceRequest.requested_at.desc())
    )
    return [_enrich(r) for r in result.scalars().all()]


@router.patch("/{request_id}/assign", response_model=schemas.ServiceRequestOut)
async def self_assign_request(
    request_id: int,
    mechanic_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.ServiceRequest).where(
            models.ServiceRequest.request_id == request_id,
            models.ServiceRequest.mechanic_id == None
        )
    )
    db_request = result.scalars().first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found or already assigned")
    db_request.mechanic_id = mechanic_id
    await db.commit()

    loaded_result = await db.execute(
        select(models.ServiceRequest)
        .options(
            selectinload(models.ServiceRequest.vehicle),
            selectinload(models.ServiceRequest.service_type),
            selectinload(models.ServiceRequest.mechanic),
        )
        .where(models.ServiceRequest.request_id == request_id)
    )
    return _enrich(loaded_result.scalars().first())


@router.patch("/{request_id}/status", response_model=schemas.ServiceRequestOut)
async def update_request_status(
    request_id: int,
    update_data: schemas.ServiceRequestStatusUpdate,
    mechanic_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.ServiceRequest).where(
        models.ServiceRequest.request_id == request_id,
        models.ServiceRequest.mechanic_id == mechanic_id
    ))
    db_request = result.scalars().first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found or not assigned to you")

    db_request.status = update_data.status.value
    await db.commit()

    loaded_result = await db.execute(
        select(models.ServiceRequest)
        .options(
            selectinload(models.ServiceRequest.vehicle),
            selectinload(models.ServiceRequest.service_type),
            selectinload(models.ServiceRequest.mechanic),
        )
        .where(models.ServiceRequest.request_id == request_id)
    )
    return _enrich(loaded_result.scalars().first())


@router.post("/{request_id}/close")
async def close_service_request(
    request_id: int,
    close_data: schemas.ServiceRequestClose,
    mechanic_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.ServiceRequest).where(
        models.ServiceRequest.request_id == request_id,
        models.ServiceRequest.mechanic_id == mechanic_id
    ))
    db_request = result.scalars().first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found or not assigned to you")

    if db_request.status == 'Completed':
        raise HTTPException(status_code=400, detail="Cannot close an already completed request")

    try:
        await db.execute(
            text("CALL sp_close_service_request(:id, :reason)"),
            {"id": request_id, "reason": close_data.reason}
        )
        await db.commit()
        return {"message": "Service request closed successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
