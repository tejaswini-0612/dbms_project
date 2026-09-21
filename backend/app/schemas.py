from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ServiceStatus(str, Enum):
    Pending = 'Pending'
    In_Progress = 'In Progress'
    Completed = 'Completed'
    Closed = 'Closed'

class PaymentMethod(str, Enum):
    Cash = 'Cash'
    Card = 'Card'
    UPI = 'UPI'

class InvoiceStatus(str, Enum):
    Unpaid = 'Unpaid'
    Paid = 'Paid'

# --- Tokens ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int
    role: str

# --- Customer ---
class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    address: Optional[str] = None

class CustomerOut(BaseModel):
    customer_id: int
    name: str
    email: EmailStr
    phone: str
    address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Mechanic ---
class MechanicCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    specialization: Optional[str] = "General Repairs"

class MechanicOut(BaseModel):
    mechanic_id: int
    name: str
    email: EmailStr
    phone: str
    specialization: Optional[str]

    class Config:
        from_attributes = True

# --- Vehicle ---
class VehicleCreate(BaseModel):
    registration_number: str
    make: str
    model: str
    year: int

class VehicleOut(BaseModel):
    vehicle_id: int
    customer_id: int
    registration_number: str
    make: str
    model: str
    year: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Service Type ---
class ServiceTypeOut(BaseModel):
    service_type_id: int
    name: str
    description: Optional[str]
    base_price: float
    estimated_minutes: Optional[int]

    class Config:
        from_attributes = True

# --- Service Request ---
class ServiceRequestCreate(BaseModel):
    vehicle_id: int
    service_type_id: int
    mechanic_id: Optional[int] = None

class ServiceRequestOut(BaseModel):
    request_id: int
    vehicle_id: int
    service_type_id: int
    mechanic_id: Optional[int]
    status: ServiceStatus
    requested_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    closed_reason: Optional[str]
    # Enriched fields
    registration_number: Optional[str] = None
    service_name: Optional[str] = None
    mechanic_name: Optional[str] = None

    class Config:
        from_attributes = True

class ServiceRequestStatusUpdate(BaseModel):
    status: ServiceStatus

class ServiceRequestClose(BaseModel):
    reason: str

# --- Invoice ---
class InvoiceOut(BaseModel):
    invoice_id: int
    request_id: int
    amount: float
    tax: float
    total_amount: float
    status: InvoiceStatus
    generated_at: datetime

    class Config:
        from_attributes = True

# --- Payment ---
class PaymentCreate(BaseModel):
    """Both fields are optional: the amount is taken from the invoice itself."""
    amount: Optional[float] = None
    method: PaymentMethod = PaymentMethod.Card

class PaymentOut(BaseModel):
    payment_id: int
    invoice_id: int
    amount: float
    method: PaymentMethod
    status: str
    paid_at: datetime

    class Config:
        from_attributes = True

# --- History ---
class ServiceHistoryOut(BaseModel):
    request_id: int
    customer_id: int
    customer_name: str
    vehicle_id: int
    registration_number: str
    service_name: str
    mechanic_name: Optional[str]
    status: str
    requested_at: datetime
    completed_at: Optional[datetime]
    total_amount: Optional[float]
    invoice_status: Optional[str]

    class Config:
        from_attributes = True
