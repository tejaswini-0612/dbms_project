from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
import app.models as models
import app.schemas as schemas
from app.database import get_db
from app.auth_utils import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

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
        data={"sub": str(new_customer.customer_id), "role": "customer"},
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
        data={"sub": str(customer.customer_id), "role": "customer"},
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
        data={"sub": str(mechanic.mechanic_id), "role": "mechanic"},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
