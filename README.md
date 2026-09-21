# Vehicle Service Management System (VSMS)

A web application designed to manage auto repair workshop operations, including vehicle registration, service bookings, mechanic job assignments, and billing.

---

## Overview

The Vehicle Service Management System is built to help auto repair shops coordinate between customers and mechanics efficiently. Customers can register their vehicles and book services, while mechanics can manage their assigned work and track job progress.

---

## Key Features

### Customer Features
- Register and manage multiple personal vehicles with details like make, model, year, and registration number
- Book vehicle services from available packages (Oil Change, Brake Repair, Battery Replacement, General Service)
- Track service requests in real time with status updates (Pending, In Progress, Completed, Closed)
- View generated invoices with GST tax calculations
- Process payments through multiple methods (Cash, Card, UPI)
- Access complete history of past services

### Mechanic Features
- View and claim pending service requests
- Update job status as work progresses
- Mark completed jobs and close service requests with cancellation reasons
- View assigned jobs and customer vehicle details

### Database Features
- Automatic invoice generation when a service is marked completed
- Atomic database procedures for safe cancellations and payments
- Optimized database views for service history retrieval
- Secure authentication using JWT tokens and password hashing

---

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- React Hook Form for form handling
- React Query for data fetching

### Backend
- FastAPI framework (Python)
- SQLAlchemy ORM for database operations
- JWT-based authentication
- Password hashing with bcrypt

### Database
- PostgreSQL 16
- Docker for containerization

---

## Database Schema

The database consists of six main tables:

```
Customer (1) ---- (N) Vehicle (1) ---- (N) Service Request
                                           |
                                           |(1)
                                           |
                                      Invoice (1) ---- (N) Payment

Service Type (1) ---- (N) Service Request
Mechanic (N) ---- (1) Service Request
```

### Main Tables
- **customer**: Stores customer login and profile information
- **vehicle**: Stores customer vehicle details
- **service_type**: Predefined service packages available
- **service_request**: Records of service bookings with status tracking
- **invoice**: Billing records with tax calculations
- **payment**: Payment transaction records
- **mechanic**: Mechanic login and profile information

### Database Triggers and Procedures
- **Invoice Generation Trigger**: Automatically creates an invoice when a service is marked completed, calculating the 18% GST tax
- **Cancellation Procedure**: Safely closes service requests with proper validation
- **Payment Procedure**: Records payments and updates invoice status atomically
- **Service History View**: Pre-computed view combining customer, vehicle, mechanic, and invoice data

---

## Setup Instructions

### Requirements
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- PostgreSQL 16 or Docker Desktop

### Quick Start (Windows)

Run the included batch script to set up everything automatically:

```
start_all.bat
```

This will:
1. Check if PostgreSQL is running and set up Docker if needed
2. Create Python virtual environment and install dependencies
3. Initialize database tables and load sample data
4. Start the backend API on http://localhost:8000
5. Start the frontend on http://localhost:5173

### Manual Setup

**Step 1: Database Setup**

Using Docker:
```
docker compose up -d
```

Or with local PostgreSQL:
```
psql -U postgres -d vsms_db -f db/schema.sql
psql -U postgres -d vsms_db -f db/seed.sql
```

**Step 2: Backend Setup**
```
cd backend
python -m venv venv
venv\Scripts\activate  (on Windows)
source venv/bin/activate  (on Linux/Mac)

pip install -r requirements.txt
python init_db.py
uvicorn app.main:app --reload --port 8000
```

Access API documentation at: http://localhost:8000/docs

**Step 3: Frontend Setup**
```
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:5173

---

## Demo Accounts

Test the application with these pre-loaded accounts:

| Role | Name | Email | Password |
|------|------|-------|----------|
| Customer | John Doe | john@example.com | password123 |
| Mechanic | Mike Smith | mike@vsms.com | password123 |
| Mechanic | Priya Nair | priya@vsms.com | password123 |

---

## Project Structure

```
VSMS/
├── backend/
│   ├── app/
│   │   ├── routers/          # API endpoints
│   │   ├── models.py         # Database models
│   │   ├── schemas.py        # Data validation
│   │   ├── database.py       # Database connection
│   │   └── main.py           # Application entry point
│   ├── init_db.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI elements
│   │   ├── pages/            # Application pages
│   │   ├── services/         # API client code
│   │   └── App.tsx
│   └── package.json
│
├── db/
│   ├── schema.sql            # Database tables and triggers
│   └── seed.sql              # Sample data
│
├── docker-compose.yml
└── start_all.bat
```

---

## Database Concepts Demonstrated

- Database Normalization: Tables are normalized to Third Normal Form
- Data Integrity: Foreign key constraints prevent invalid data
- Automation: Triggers handle automatic invoice generation
- Transaction Safety: Stored procedures ensure consistent data updates
- Query Optimization: Database views reduce redundant joins

---

## Testing

- Test API endpoints at: http://localhost:8000/docs
- Build frontend for production: `cd frontend && npm run build`

---

Made as a DBMS course project for 2nd year undergraduate studies.
