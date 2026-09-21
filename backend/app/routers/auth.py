from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
from typing import Literal
import app.models as models
import app.schemas as schemas
from app.database import get_db
from app.auth_utils import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/enter/{role}", response_model=schemas.Token)
async def enter_as_role(role: Literal["customer", "mechanic"], db: AsyncSession = Depends(get_db)):
    """Passwordless entry for the simulation: hand back a session for the
    first customer or mechanic on record."""
    if role == "customer":
        result = await db.execute(select(models.Customer).order_by(models.Customer.customer_id))
        user = result.scalars().first()
        user_id = user.customer_id if user else None
    else:
        result = await db.execute(select(models.Mechanic).order_by(models.Mechanic.mechanic_id))
        user = result.scalars().first()
        user_id = user.mechanic_id if user else None

    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"No {role} exists yet. Seed the database (python init_db.py) first.",
        )

    access_token = create_access_token(
        data={"sub": str(user_id), "role": role, "name": user.name, "email": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/customer/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
async def signup_customer(customer: schemas.CustomerCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Customer).where(models.Customer.email == customer.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_customer = models.Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        password_hash=get_password_hash(customer.password),
        address=customer.address
    )
    db.add(new_customer)
    await db.commit()
    await db.refresh(new_customer)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(new_customer.customer_id),
            "role": "customer",
            "name": new_customer.name,
            "email": new_customer.email,
        },
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/mechanic/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
async def signup_mechanic(mechanic: schemas.MechanicCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Mechanic).where(models.Mechanic.email == mechanic.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_mechanic = models.Mechanic(
        name=mechanic.name,
        email=mechanic.email,
        phone=mechanic.phone,
        password_hash=get_password_hash(mechanic.password),
        specialization=mechanic.specialization or "General Repairs"
    )
    db.add(new_mechanic)
    await db.commit()
    await db.refresh(new_mechanic)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(new_mechanic.mechanic_id),
            "role": "mechanic",
            "name": new_mechanic.name,
            "email": new_mechanic.email,
        },
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/customer/login", response_model=schemas.Token)
async def login_customer(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Customer).where(models.Customer.email == form_data.username))
    customer = result.scalars().first()
    if not customer or not verify_password(form_data.password, customer.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(customer.customer_id),
            "role": "customer",
            "name": customer.name,
            "email": customer.email,
        },
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/mechanic/login", response_model=schemas.Token)
async def login_mechanic(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Mechanic).where(models.Mechanic.email == form_data.username))
    mechanic = result.scalars().first()
    if not mechanic or not verify_password(form_data.password, mechanic.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(mechanic.mechanic_id),
            "role": "mechanic",
            "name": mechanic.name,
            "email": mechanic.email,
        },
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
