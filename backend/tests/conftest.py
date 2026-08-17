import pytest
from httpx import AsyncClient, ASGITransport
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.main import app
from app.database import get_db, Base
from app.auth_utils import get_password_hash

# Use the same database URL or a test database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/vsms_db")
engine = create_async_engine(DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="function")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

# Helper to get auth headers
@pytest.fixture(scope="function")
async def customer_headers(client):
    # In a real test suite, you'd insert a test customer directly into the DB or via signup here
    # For now, assuming seed data exists: john@example.com / password123
    response = await client.post("/auth/customer/login", data={"username": "john@example.com", "password": "password123"})
    if response.status_code == 200:
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    return {}

@pytest.fixture(scope="function")
async def mechanic_headers(client):
    # Assuming seed data: mike@vsms.com / password123
    response = await client.post("/auth/mechanic/login", data={"username": "mike@vsms.com", "password": "password123"})
    if response.status_code == 200:
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    return {}
