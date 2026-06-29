// Database types for the AutoCheck schema (supabase/migrations).
//
// Hand-written to mirror the SQL. Once you have a project you can regenerate
// these to stay in sync:
//   supabase gen types typescript --linked > app/lib/supabase/types.ts

export type UserRole = 'driver' | 'owner' | 'staff' | 'admin'
export type TenantPlan = 'standard' | 'branded' | 'pro'
export type GarageMode = 'circle' | 'verified'
export type BookingStatus =
  | 'new'
  | 'confirmed'
  | 'in_bay'
  | 'ready'
  | 'collected'
  | 'cancelled'
export type Fulfilment = 'wait' | 'drop'

// NB: these are `type` aliases, not `interface`s — deliberately. supabase-js's
// GenericTable constraint requires Row/Insert/Update to satisfy
// `Record<string, unknown>`, and an `interface` is not assignable to that (it
// lacks an implicit index signature) whereas a `type` object literal is. Using
// `interface` here makes the typed client silently fall back to `never`.

export type Tenant = {
  id: string
  slug: string
  name: string
  short_name: string
  mark: string
  accent: string
  accent_dark: string
  accent_soft: string
  domain: string
  plan: TenantPlan
  plan_label: string | null
  price: string | null
  sub: string | null
  features: string[]
  is_verified: boolean
  created_at: string
}

// Presentation-only trust decoration for a garage card (see 0003 migration).
export type GarageDetails = {
  dist?: string
  next?: string
  trustType?: 'visits' | 'referral' | 'circle'
  trust?: string
  avatars?: { i: string; c: string }[]
  circleAvatars?: { i: string; c: string }[]
  circleText?: string
  visits?: string
  open?: string
  avail?: string
}

export type Profile = {
  id: string
  role: UserRole
  tenant_id: string | null
  full_name: string | null
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export type Garage = {
  id: string
  tenant_id: string
  name: string
  area: string
  bays_total: number
  mode: GarageMode
  is_verified: boolean
  rating: number | null
  is_accepting: boolean
  quote: string | null
  quote_by: string | null
  sort: number
  details: GarageDetails
  created_at: string
}

export type Issue = {
  id: string
  tenant_id: string
  label: string
  est_mins: number
  sort: number
}

export type Service = {
  id: string
  tenant_id: string
  key: string
  label: string
  est_mins: number
  sort: number
}

export type Booking = {
  id: string
  tenant_id: string
  garage_id: string
  driver_id: string | null
  customer_name: string
  customer_phone: string | null
  vehicle: string | null
  note: string | null
  ai_summary: string | null
  slot_at: string | null
  slot_label: string | null
  fulfilment: Fulfilment | null
  status: BookingStatus
  has_photo: boolean
  deposit_paid: boolean
  channel: 'app' | 'whatsapp'
  created_at: string
  updated_at: string
}

export type BookingIssue = {
  booking_id: string
  label: string
}

// Minimal shape consumed by @supabase/supabase-js generics. Only the tables the
// app reads/writes through the typed client are spelled out here; extend as the
// data layer grows.
// supabase-js requires each table to carry a `Relationships` array to satisfy
// its GenericSchema constraint; without it the typed client silently falls back
// to `never`. We keep relationships empty (join results are typed at the call
// site via `.returns<T>()`), which is enough for column-level type inference.
type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] }

export interface Database {
  public: {
    Tables: {
      tenants: Table<Tenant>
      tenant_slugs: Table<{ slug: string; tenant_id: string }>
      profiles: Table<Profile>
      garages: Table<Garage>
      garage_members: Table<{ garage_id: string; profile_id: string }>
      issues: Table<Issue>
      services: Table<Service>
      working_hours: Table<{
        id: string
        garage_id: string
        weekday: number
        opens_at: string
        closes_at: string
        is_open: boolean
      }>
      bookings: Table<Booking>
      booking_issues: Table<BookingIssue>
    }
    Views: Record<string, never>
    Functions: {
      auth_role: { Args: Record<string, never>; Returns: UserRole }
      auth_tenant_id: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      user_role: UserRole
      tenant_plan: TenantPlan
      garage_mode: GarageMode
      booking_status: BookingStatus
      fulfilment: Fulfilment
    }
  }
}
