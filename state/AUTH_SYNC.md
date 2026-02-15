# Clerk Authentication + Redux + Database Sync

## Overview

This setup provides complete authentication synchronization between:
1. **Clerk** - Authentication provider (handles login/signup)
2. **Redux** - Client-side state management (UI access to user data)
3. **Database** - PostgreSQL via Prisma (persistent user data)

## Architecture Flow

```
User Signs In (Clerk)
       ↓
AuthSync Component
       ↓
   ┌────────────────┐
   │  Clerk Token   │ → localStorage (for API auth)
   └────────────────┘
       ↓
   ┌────────────────┐
   │ Redux Global   │ → state.global.user (for UI)
   │     State      │
   └────────────────┘
       ↓
   ┌────────────────┐
   │ RTK Query API  │ → POST /api/users/sync
   └────────────────┘
       ↓
   ┌────────────────┐
   │   Database     │ → Prisma upsert to PostgreSQL
   └────────────────┘
```

## Files Created

### 1. Client Side

#### `/client/components/auth-sync.tsx`
- Client component that syncs Clerk auth with Redux and database
- Runs automatically when user signs in/out
- Refreshes token every 5 minutes

#### `/client/state/index.ts` (updated)
- Added `AuthUser` interface to global state
- Added user reducers: `setUser`, `clearUser`, `updateUserRole`

#### `/client/state/api.ts` (updated)
- Added `syncUser` mutation endpoint
- Syncs user data to database via POST `/api/users/sync`

#### `/client/app/layout.tsx` (updated)
- Integrated `<AuthSync />` component in root layout

### 2. Server Side

#### `/server/src/routes/users.ts`
- **POST /api/users/sync** - Upsert user from Clerk to database
- **GET /api/users** - Get all users (paginated, with filters)
- **GET /api/users/:id** - Get single user with orders
- **PUT /api/users/:id/status** - Update user status

#### `/server/src/index.ts` (updated)
- Integrated users router at `/api/users`

## Usage

### Accessing User Data in Components

```tsx
"use client"

import { useAppSelector } from "@/state/redux"

export function UserProfile() {
  // Get user from Redux global state
  const user = useAppSelector((state) => state.global.user)

  if (!user.id) {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  )
}
```

### Role-Based Rendering

```tsx
"use client"

import { useAppSelector } from "@/state/redux"

export function AdminPanel() {
  const user = useAppSelector((state) => state.global.user)

  if (user.role !== "admin") {
    return <div>Access denied</div>
  }

  return <div>Admin Panel Content</div>
}
```

### Checking Authentication Status

```tsx
"use client"

import { useAppSelector } from "@/state/redux"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedPage() {
  const router = useRouter()
  const user = useAppSelector((state) => state.global.user)

  useEffect(() => {
    if (!user.id) {
      router.push("/login")
    }
  }, [user.id, router])

  if (!user.id) return null

  return <div>Protected Content</div>
}
```

### Accessing Clerk User Directly

```tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { useAppSelector } from "@/state/redux"

export function UserDisplay() {
  // Clerk user (full Clerk data)
  const { user: clerkUser } = useUser()

  // Redux user (synced data)
  const user = useAppSelector((state) => state.global.user)

  return (
    <div>
      {/* Clerk-specific data */}
      <img src={clerkUser?.imageUrl} alt="Avatar" />

      {/* Synced data from Redux */}
      <p>{user.name}</p>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  )
}
```

## How It Works

### 1. User Signs In

When a user signs in via Clerk:

```tsx
// Happens automatically via Clerk's SignIn component
<SignIn />
```

### 2. AuthSync Component Detects Change

The `AuthSync` component listens to Clerk's `useUser()` hook:

```tsx
const { user, isLoaded } = useUser()

useEffect(() => {
  if (isLoaded && user) {
    // Sync user data
  }
}, [user, isLoaded])
```

### 3. Three-Step Sync Process

**Step 1: Store Token**
```tsx
const token = await getToken()
localStorage.setItem("clerk_token", token)
```

**Step 2: Update Redux**
```tsx
dispatch(setUser({
  id: user.id,
  name: user.fullName,
  email: user.primaryEmailAddress?.emailAddress,
  role: user.publicMetadata?.role || "user"
}))
```

**Step 3: Sync to Database**
```tsx
await syncUser({
  clerkId: user.id,
  name: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  metadata: { ... }
}).unwrap()
```

### 4. Database Upsert

Backend receives the sync request and upserts the user:

```typescript
// If user exists (by email) → update
// If user doesn't exist → create
await prisma.user.upsert({
  where: { email },
  update: { name, phone, role, lastActive },
  create: { email, name, phone, role, status: "active" }
})
```

## User State Structure

### Redux Global State

```typescript
interface AuthUser {
  id: string | null        // Clerk user ID
  name: string | null      // Full name
  email: string | null     // Email address
  role: "user" | "admin" | null  // User role
}

// Access via:
const user = useAppSelector((state) => state.global.user)
```

### Database Schema (Prisma)

```prisma
model User {
  id                 String   @id @default(cuid())
  name               String
  email              String   @unique
  password           String   // Empty for Clerk users
  phone              String?
  status             String   @default("active")
  role               String   @default("user")
  verificationStatus String   @default("verified")
  totalOrders        Int      @default(0)
  totalVolume        Float    @default(0)
  joinedAt           DateTime @default(now())
  lastActive         DateTime @default(now())
  orders             Order[]
}
```

## API Endpoints

### POST /api/users/sync

Sync user from Clerk to database.

**Request Body:**
```json
{
  "clerkId": "user_xxx",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "user",
  "metadata": {
    "imageUrl": "https://...",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "joinedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/users

Get all users with pagination and filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name or email
- `status` - Filter by status (active, suspended, pending)
- `role` - Filter by role (user, admin)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### GET /api/users/:id

Get single user by ID with recent orders.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "orders": [...]
  }
}
```

### PUT /api/users/:id/status

Update user status (admin action).

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Valid statuses:** `active`, `suspended`, `pending`

## Token Management

### Token Storage

The Clerk JWT token is stored in localStorage for API authentication:

```typescript
localStorage.setItem("clerk_token", token)
```

### Token Usage in API Calls

RTK Query automatically includes the token in all API requests:

```typescript
// In state/api.ts
prepareHeaders: async (headers) => {
  const token = localStorage.getItem("clerk_token")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  return headers
}
```

### Token Refresh

Token is automatically refreshed every 5 minutes:

```typescript
setInterval(async () => {
  const token = await getToken({ skipCache: true })
  localStorage.setItem("clerk_token", token)
}, 5 * 60 * 1000)
```

## Environment Variables

### Client (.env.local)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# API
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

### Server (.env)

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/rayex"

# Server
PORT=3003
NODE_ENV=development
```

## Testing the Flow

### 1. Start the servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 2. Sign up a new user

Navigate to `/signup` and create an account. Watch the console:

```
AuthSync: User signed in
AuthSync: Redux state updated
AuthSync: Database sync initiated
AuthSync: User synced to database successfully
```

### 3. Check Redux state

In browser console:
```javascript
// Get Redux state
localStorage.getItem("clerk_token") // Should have token
```

### 4. Check database

```sql
SELECT * FROM users ORDER BY "joinedAt" DESC LIMIT 1;
```

You should see the newly created user with:
- Clerk user ID
- Name, email from Clerk
- Role from metadata
- status: "active"
- verificationStatus: "verified"

## Troubleshooting

### User not syncing to database

**Check:**
1. Is AuthSync component rendered? (It's in root layout)
2. Is backend running? (http://localhost:3003/health)
3. Is database connected? (Check Prisma connection)
4. Check browser console for errors
5. Check server logs for API errors

### Token not included in API requests

**Check:**
1. Is token in localStorage? `localStorage.getItem("clerk_token")`
2. Is user signed in? Check Clerk's `useUser()` hook
3. Check Network tab → Request Headers → Authorization

### Redux state not updating

**Check:**
1. Is component using `useAppSelector`?
2. Is `<StoreProvider>` wrapping the app?
3. Check Redux DevTools for dispatched actions

### Role not being set correctly

**Check:**
1. Is role set in Clerk Dashboard? (User → Metadata → publicMetadata.role)
2. Check `user.publicMetadata?.role` in AuthSync component
3. Database should show correct role after sync

## Best Practices

1. **Always use `useAppSelector` for user data in UI components**
   - Don't call Clerk's `useUser()` in every component
   - Redux state is faster and more predictable

2. **Use Clerk hooks only for authentication actions**
   - `useAuth()` - For getToken, signOut
   - `useUser()` - For Clerk-specific data (imageUrl, etc.)

3. **Database is source of truth for business data**
   - Total orders, volume, verification status
   - Fetch from API when needed, don't rely on Clerk metadata

4. **Handle loading states**
   ```tsx
   const user = useAppSelector(state => state.global.user)
   if (!user.id) return <div>Loading...</div>
   ```

5. **Protect routes server-side too**
   - Redux is client-side only
   - Use Clerk's `currentUser()` in layouts for server-side protection

## Security Notes

- Clerk handles all password security
- JWT tokens expire automatically
- Database password field is empty for Clerk users
- Role is stored in Clerk metadata (publicMetadata for admin-controlled)
- Token is refreshed every 5 minutes automatically
- Backend should verify Clerk tokens (add Clerk middleware for production)
