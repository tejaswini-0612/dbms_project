from sqlalchemy import Column, Integer, String, Text, SmallInteger, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Customer(Base):
    __tablename__ = "customer"

    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(15), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    vehicles = relationship("Vehicle", back_populates="customer")


class Mechanic(Base):
    __tablename__ = "mechanic"

    mechanic_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(15), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    specialization = Column(String(100))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    service_requests = relationship("ServiceRequest", back_populates="mechanic")


class Vehicle(Base):
    __tablename__ = "vehicle"

    vehicle_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer.customer_id", ondelete="CASCADE"), nullable=False, index=True)
    registration_number = Column(String(20), unique=True, nullable=False)
    make = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    year = Column(SmallInteger)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    customer = relationship("Customer", back_populates="vehicles")
    service_requests = relationship("ServiceRequest", back_populates="vehicle")


class ServiceType(Base):
    __tablename__ = "service_type"

    service_type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    description = Column(Text)
    base_price = Column(Numeric(10, 2), nullable=False)
    estimated_minutes = Column(Integer)


class ServiceRequest(Base):
    __tablename__ = "service_request"

    request_id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicle.vehicle_id", ondelete="CASCADE"), nullable=False, index=True)
    service_type_id = Column(Integer, ForeignKey("service_type.service_type_id"), nullable=False)
    mechanic_id = Column(Integer, ForeignKey("mechanic.mechanic_id"), nullable=True, index=True)
    status = Column(Enum('Pending', 'In Progress', 'Completed', 'Closed', name="service_status"), default='Pending', nullable=False, index=True)
    requested_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    closed_reason = Column(Text, nullable=True)

    vehicle = relationship("Vehicle", back_populates="service_requests")
    service_type = relationship("ServiceType")
    mechanic = relationship("Mechanic", back_populates="service_requests")
    invoice = relationship("Invoice", uselist=False, back_populates="service_request")


class Invoice(Base):
    __tablename__ = "invoice"

    invoice_id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("service_request.request_id", ondelete="CASCADE"), unique=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    tax = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum('Unpaid', 'Paid', name="invoice_status"), default='Unpaid', nullable=False)
    generated_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    service_request = relationship("ServiceRequest", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")


class Payment(Base):
    __tablename__ = "payment"

    payment_id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoice.invoice_id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(Enum('Cash', 'Card', 'UPI', name="payment_method"), nullable=False)
    status = Column(Enum('Pending', 'Success', 'Failed', name="payment_status"), default='Success', nullable=False)
    paid_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="payments")
