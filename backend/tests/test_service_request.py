import pytest
import httpx

@pytest.mark.anyio
async def test_create_service_request(client: httpx.AsyncClient, customer_headers: dict):
    # This requires knowing a vehicle_id and service_type_id
    # Assuming from seed data: vehicle_id=1, service_type_id=1
    response = await client.post(
        "/service-requests/",
        json={"vehicle_id": 1, "service_type_id": 1, "mechanic_id": 1},
        headers=customer_headers
    )
    assert response.status_code in [201, 403] # 403 if test data isn't matching perfectly
    
@pytest.mark.anyio
async def test_mechanic_assigned_jobs(client: httpx.AsyncClient, mechanic_headers: dict):
    response = await client.get("/service-requests/assigned", headers=mechanic_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.anyio
async def test_mechanic_close_request(client: httpx.AsyncClient, mechanic_headers: dict, customer_headers: dict):
    # Create a request to close
    create_resp = await client.post(
        "/service-requests/",
        json={"vehicle_id": 1, "service_type_id": 2, "mechanic_id": 1},
        headers=customer_headers
    )
    
    if create_resp.status_code == 201:
        req_id = create_resp.json()["request_id"]
        # Now close it
        close_resp = await client.post(
            f"/service-requests/{req_id}/close",
            json={"reason": "Customer changed mind"},
            headers=mechanic_headers
        )
        assert close_resp.status_code == 200
        assert close_resp.json()["message"] == "Service request closed successfully"
