// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = 'customer' | 'mechanic'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
}

export interface AuthTokenPayload {
  sub: string  // user id as string
  role: Role
  name: string
  exp: number
}

export interface LoginRequest {
  email: string
  password: string
  role: Role
}

export interface CustomerSignupRequest {
  name: string
  email: string
  phone: string
  password: string
  address?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

export interface Vehicle {
  vehicle_id: number
  customer_id: number
  registration_number: string
  make: string
  model: string
  year: number
  created_at: string
}

export interface CreateVehicleRequest {
  registration_number: string
  make: string
  model: string
  year: number
}

// ─── Mechanics ───────────────────────────────────────────────────────────────

export interface Mechanic {
  mechanic_id: number
  name: string
  specialization: string | null
}

// ─── Service Types ───────────────────────────────────────────────────────────

export interface ServiceType {
  service_type_id: number
  name: string
  description: string | null
  base_price: number
  estimated_minutes: number | null
}

// ─── Service Requests ────────────────────────────────────────────────────────

export type ServiceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Closed'

export interface ServiceRequest {
  request_id: number
  vehicle_id: number
  service_type_id: number
  mechanic_id: number | null
  status: ServiceStatus
  requested_at: string
  updated_at: string
  completed_at: string | null
  closed_reason: string | null
  // Joined fields returned by some endpoints
  registration_number?: string
  service_name?: string
  mechanic_name?: string | null
}

export interface CreateServiceRequestRequest {
  vehicle_id: number
  service_type_id: number
  mechanic_id: number | null
}

export interface UpdateStatusRequest {
  status: ServiceStatus
}

export interface CloseRequestRequest {
  reason: string
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'Unpaid' | 'Paid'
export type PaymentMethod = 'Cash' | 'Card' | 'UPI'

export interface Invoice {
  invoice_id: number
  request_id: number
  amount: number
  tax: number
  total_amount: number
  status: InvoiceStatus
  generated_at: string
}

export interface PayRequest {
  method: PaymentMethod
}

// ─── Service History ─────────────────────────────────────────────────────────

export interface ServiceHistoryEntry {
  request_id: number
  customer_id: number
  customer_name: string
  vehicle_id: number
  registration_number: string
  service_name: string
  mechanic_name: string | null
  status: ServiceStatus
  requested_at: string
  completed_at: string | null
  total_amount: number | null
  invoice_status: InvoiceStatus | null
}
