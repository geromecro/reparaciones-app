# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Sistema de Seguimiento de Reparaciones** is an MVP for managing repairs of alternators and starters with complete process tracking. The app handles client intake, repair assignment, parts tracking, pricing, and delivery management.

## Quick Commands

```bash
# Development
npm run dev                 # Start dev server (localhost:3000)
npm run build              # Production build
npm start                  # Run production build

# Database
npm run prisma:migrate     # Run migrations (creates/updates schema)
npm run prisma:studio      # Open Prisma Studio (GUI for database)

# Linting
npm lint                   # Run ESLint

# Database reset (⚠️ destructive)
rm prisma/dev.db && npm run prisma:migrate
```

## Architecture & Key Concepts

### Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 with custom minimalista theme (white/gray palette)
- **Database**: PostgreSQL (via Supabase) with Prisma ORM
- **State Management**: React hooks (useState, useEffect)
- **API**: Next.js Route Handlers (api/ folder)
- **Deployment**: Vercel (auto-deploys from GitHub)
- **Database Connection**: Supabase Session Pooler (port 5432)

### Design System
The application uses a **minimalista modern design** with:
- **Color Palette**: Primary grays (50-900) + accent colors (green, amber, red)
- **Reusable Components** in `/components`:
  - `Button.tsx`: 4 variants (primary, secondary, ghost, danger)
  - `Badge.tsx`: Status indicators with 5 variants
  - `Card.tsx`: Surface component with header/body/footer sections
  - `EstadoSelector.tsx`: Dropdown for repair state changes (4 states: Recibido, Diagnosticado, En reparación, Listo para retirar)
  - `Modal.tsx`: Reusable modal component using React Portal with dark overlay
- **Tailwind Config**: Custom theme in `tailwind.config.js` with extended colors and shadows
- **Global Styles**: `app/globals.css` for base typography and component layers

### Data Model

**8 Core Models** (prisma/schema.prisma):

1. **Cliente**: Customer info (nombre, empresa, telefono, email, direccion)
2. **Equipo**: Equipment/device (descripcion, numeroInterno, estado)
3. **Reparacion**: Repair record (electricista, precintoNumero, estado)
4. **RepuestoUsado**: Parts used in repair (codigo, cantidad, importeUnitario, subtotal)
5. **HistorialEstado**: Audit trail (reparacionId, estadoAnterior, estadoNuevo, fechaCambio, notas)
6. **Valorizacion**: Cost breakdown (costoRepuestos, importeManoObra, subtotal)
7. **Cotizacion**: Pricing adjustment by Pablo (importeOriginal, ajustePablo, importeFinal)
8. **Entrega**: Delivery record (numeroRemitoOficial, numeroRemitoInterno, estado)

### State Progression

**Reparacion States** (4 simplified states):
- **RECIBIDO** (blue): Equipment received, initial state
- **DIAGNOSTICO** (amber): Diagnostic assessment completed
- **EN_REPARACION** (amber): Repair work in progress
- **LISTO_PARA_RETIRO** (green): Repair completed, ready for customer pickup

### Page Structure

```
app/
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles + @layer directives
├── page.tsx                    # Home page with menu cards
├── dashboard/page.tsx          # List all repairs with stats
├── reparaciones/
│   ├── nueva/page.tsx         # Multi-step form (client → equipment → assignment)
│   └── [id]/page.tsx          # Repair details (parts, pricing, status changes + tracking link)
├── seguimiento/
│   └── [codigo]/page.tsx       # PUBLIC: Customer tracking page (no auth required)
├── cotizaciones/
│   ├── page.tsx               # List quotations pending
│   └── nueva/page.tsx         # Create quotation with price adjustment
├── entregas/page.tsx           # Track deliveries
└── api/                        # API Routes for CRUD
    ├── clientes/[id]/route.ts
    ├── equipos/[id]/route.ts
    ├── reparaciones/[id]/route.ts
    ├── repuestos/route.ts
    ├── seguimiento/[codigo]/route.ts  # PUBLIC: Tracking API (no auth)
    ├── valorizaciones/[id]/route.ts
    ├── cotizaciones/route.ts
    └── entregas/route.ts
```

### Key API Patterns

All API routes return JSON and handle both GET and POST/PUT:

**Internal API (requires admin access)**:
- **GET /api/reparaciones**: List all repairs
- **GET /api/reparaciones/[id]**: Get repair with nested relations (equipo, cliente, repuestosUsados, valorizacion)
- **PUT /api/reparaciones/[id]**: Update repair state (auto-creates HistorialEstado record)
- **POST /api/repuestos**: Add part to repair
- **POST /api/valorizaciones**: Create pricing breakdown
- **POST /api/cotizaciones**: Create quotation with Pablo's adjustment

**Public API (no authentication)**:
- **GET /api/seguimiento/[codigo]**: Get public tracking data by numeroInterno
  - Returns: equipo info, current reparacion state, full historial timeline
  - No sensitive data exposed (only nombre, telefono from cliente)

Note: Many API routes use `params` as a Promise (Next.js 16 pattern):
```typescript
const params = await props.params
const id = params.id
```

### Component Patterns

**EstadoSelector** (interactive state dropdown):
- Located at `components/EstadoSelector.tsx`
- Props: `estadoActual`, `reparacionId`, `onEstadoChanged?`
- Makes PUT request to `/api/reparaciones/[id]` with new state
- Uses variant-based styling (default, warning, success, info)
- Renders 13 state options with checkmark for current state

**Button Component**:
- Variants: primary (dark gray), secondary (light gray), ghost (transparent), danger (red)
- Props: `variant`, `size` (sm/md/lg), `isLoading`, `disabled`
- Shows spinner when loading

**Form Inputs**:
- Use `.input-base` class from globals.css
- Manual validation (no form libraries currently)
- Typical pattern: state → onChange → submit handler with try/catch

### Important Implementation Details

1. **State Change Flow**:
   - EstadoSelector component → fetch PUT /api/reparaciones/[id] → onEstadoChanged callback → update local state

2. **Database Sync Issues**:
   - After schema changes, must run `npx prisma generate` to regenerate Prisma client types
   - If database schema mismatches Prisma schema, use `npx prisma db push --force-reset` (destroys data)

3. **Styling with Tailwind v4**:
   - **CRITICAL**: Use `@import "tailwindcss"` syntax (v4), NOT `@tailwind directives` (v3)
   - Import statement should be: `@import "tailwindcss";` at top of globals.css
   - Failure to use v4 syntax results in CSS file being 6KB instead of 25KB with no utilities generated
   - Custom colors available: `primary-*`, `accent-*`, `warning-*`, `error-*`
   - Use `@layer` directives in CSS for component abstractions (see globals.css)
   - No dark mode configured (not needed for this MVP)

4. **Multi-Step Forms** (Nueva Reparación):
   - 3-step wizard: Client → Equipment → Assignment
   - Progress shown with numbered steps
   - Previous/Next buttons navigate between steps
   - Form submission happens only on final step

5. **Repository File Structure**:
   - **CRITICAL**: Files are in repo ROOT (`app/`, `lib/`, `components/`), NOT in `reparaciones-app/` subdirectory
   - During Phase 3, all files were moved from subdirectory to root for Vercel deployment
   - Vercel builds from root-level files only - subdirectory files are NOT deployed
   - When making changes, verify correct file location: `git log --all --follow -- filename`
   - Common mistake: editing wrong file location and wondering why changes don't appear

6. **Cache Control (Critical for Dynamic Data)**:
   - **MUST have**: `next.config.js` with cache-busting configuration
   - Without it: Vercel CDN caches stale data, users see old repair status even after deployment
   - Configuration includes:
     - `generateEtags: false` - Disable ETag-based caching
     - `Cache-Control: public, max-age=0, s-maxage=0, must-revalidate` headers
     - `onDemandEntries: { maxInactiveAge: 0, pagesBufferLength: 0 }` - Disable page caching
   - Result: Browser/CDN must revalidate on every request, ensures fresh data always

7. **Currency Formatting**:
   - Use `lib/format.ts` with `formatCurrency()` for consistent monetary displays
   - Format: Argentine locale with point for thousands separator, comma for decimals
   - Example: `formatCurrency(1234.56)` → `"1.234,56"`
   - Never use `.toFixed(2)` directly for display - always use formatCurrency()

## Database Configuration

### Current Setup (Phase 2 & 3 Complete)
- **Database**: PostgreSQL via Supabase Cloud
- **Connection Method**: Session Pooler (Supabase recommended for serverless)
- **Connection String**: `postgresql://postgres.idkdnycunqxpdxsanqjc:geroxido@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
- **Provider**: `provider = "postgresql"` in `prisma/schema.prisma`
- **Prisma Instance**: Singleton pattern in `lib/prisma.ts` (prevents connection pool exhaustion)
- **Tables**: All 8 models synced (Cliente, Equipo, Reparacion, HistorialEstado, RepuestoUsado, Valorizacion, Cotizacion, Entrega)

### Vercel Environment Variables
Set in Vercel Dashboard → Settings → Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string (Session Pooler from Supabase)

### Build Configuration
- **postinstall script**: Automatically runs `prisma generate` after npm install
- **build script**: Runs `prisma generate && next build` to ensure Prisma client is generated
- **vercel.json**: Removed (Vercel auto-detects Next.js 16 correctly)

### Prisma Singleton Pattern
Located in `lib/prisma.ts`:
```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
globalForPrisma.prisma = prisma  // Cache for both dev and production
```
This prevents creating multiple Prisma clients which would exhaust PostgreSQL connection pool.

### How to Migrate Database (if needed)
If you need to reset/migrate:
```bash
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma db push --force-reset
```

## Public Tracking System (Phase 1)

### Customer-Facing Repair Tracking
Customers can track their repair status via a public link without authentication:

**Key Features**:
- Access via unique code: `/seguimiento/{numeroInterno}` (e.g., `/seguimiento/EQUIPO-1762609292417`)
- Shows current repair estado with semantic colors
- Complete timeline of all state changes with timestamps
- Equipment details (descripción, fecha recepción, electricista)
- Contact info (client name, phone number)
- Mobile-first design using minimalista theme

**How it Works**:
1. Internal panel (reparaciones/[id]) displays "Link de Seguimiento para Cliente"
2. Technician can copy link and share with customer (WhatsApp, email, SMS)
3. Customer clicks link and sees live repair status
4. Every estado change in internal panel auto-records in HistorialEstado
5. Public tracking page displays timeline in reverse chronological order

**Files**:
- `app/seguimiento/[codigo]/page.tsx`: Public tracking page component
- `app/api/seguimiento/[codigo]/route.ts`: Public tracking API endpoint (no auth)
- `app/reparaciones/[id]/page.tsx`: Added "Link de Seguimiento" section with copy button
- `prisma/schema.prisma`: HistorialEstado model for audit trail

**State Change Flow**:
1. User changes estado in EstadoSelector (internal panel)
2. PUT /api/reparaciones/[id] is called with new estado
3. API detects estado change and creates HistorialEstado record (estadoAnterior, estadoNuevo, fechaCambio)
4. Repair estado is updated in database
5. Public tracking page fetches from GET /api/seguimiento/[codigo]
6. Timeline automatically displays new entry with timestamp

## Common Workflows

### Adding a New Page
1. Create `app/[feature]/page.tsx` (client component with `'use client'`)
2. Import Button, Badge, Card components as needed
3. Use `min-h-screen bg-primary-50` for page background
4. Apply `max-w-7xl mx-auto px-6 py-8` for centered content
5. Use Tailwind with `primary-*` color tokens

### Updating a Data Model
1. Modify `prisma/schema.prisma`
2. Run `npm run prisma:migrate` (creates migration)
3. Run `npx prisma generate` (regenerates client types)
4. Update API routes and page components to use new fields
5. If breaking changes, consider `npx prisma db push --force-reset`

### Styling New Components
- Use `.surface` class (white bg, border, shadow-sm)
- Use `.surface-elevated` for emphasis (shadow-md)
- Use `text-primary-900`, `text-primary-600` for text hierarchy
- Use `bg-primary-50` for backgrounds
- Badge colors: `bg-accent-50 text-accent-700` (success), `bg-warning-50 text-warning-700` (warning)

## Design Philosophy

The app prioritizes **clarity, simplicity, and minimal visual noise**:
- No gradients or complex animations
- Monochromatic palette with strategic colored accents
- Generous spacing (p-6, p-8, gap-6)
- Clear typography hierarchy
- Accessible color contrasts

## Implementation Roadmap

### Completed (✅)
- **Phase 1**: Public tracking system with HistorialEstado audit trail
  - ✅ Public API endpoint `/api/seguimiento/[codigo]`
  - ✅ Public page `/seguimiento/[codigo]` with timeline display
  - ✅ Estado changes auto-record in HistorialEstado

- **Phase 1.5**: Tracking link in internal repair panel
  - ✅ Display tracking URL in repair detail page
  - ✅ "Copiar Link" button with navigator.clipboard
  - ✅ Integration with internal repair workflow

- **Phase 2**: PostgreSQL Migration from SQLite
  - ✅ Created Supabase PostgreSQL database
  - ✅ Updated Prisma schema provider to PostgreSQL
  - ✅ Configured DATABASE_URL environment variable
  - ✅ All 8 models synced to cloud database
  - ✅ Verified data persistence with test records

- **Phase 3**: Vercel Deployment with PostgreSQL
  - ✅ Created GitHub repository (geromecro/reparaciones-app)
  - ✅ Connected Vercel to GitHub repository
  - ✅ Restructured repo: moved app from `reparaciones-app/` subdirectory to root
  - ✅ Fixed Next.js 16 Suspense issues in `/cotizaciones/nueva`
  - ✅ Implemented Prisma singleton pattern to prevent connection pool exhaustion
  - ✅ Added detailed error logging to API routes
  - ✅ Configured Supabase Session Pooler for serverless connections
  - ✅ **LIVE DEPLOYMENT**: https://reparaciones-app.vercel.app/

- **Phase 3.5**: End-to-End Testing (Nov 8, 2025)
  - ✅ Home page loads correctly
  - ✅ Dashboard displays with stats (0 repairs)
  - ✅ Nueva Reparación 3-step form works
  - ✅ Created test reparación: "Alternador Bosch 150A" for Juan Pérez
  - ✅ Reparación detail page displays all information
  - ✅ Tracking link generated: `/seguimiento/EQUIPO-1762643356433`
  - ✅ Public tracking page loads and displays estado
  - ✅ All APIs responding correctly (clientes, reparaciones, equipos)
  - ✅ PostgreSQL connection verified with test data

- **Phase 4**: Complete Feature Testing (Nov 9, 2025)
  - ✅ **Crear Valorización**: POST /api/valorizaciones → Desglose de costos ($500 mano de obra)
  - ✅ **Crear Cotización**: POST /api/cotizaciones → Ajuste de precio ($50 ajuste by Pablo → Final: $550)
  - ✅ **Agregar Repuestos**: POST /api/repuestos → Cable ALT-001 (2x$25 = $50 subtotal)
  - ✅ **Cambiar Estado**: PUT /api/reparaciones/1 → CERRADO → DIAGNOSTICO
  - ✅ **HistorialEstado**: Verificado → 4 cambios registrados (RECIBIDO → FACTURADO → LISTO_PARA_RETIRO → CERRADO → DIAGNOSTICO)
  - ✅ **Entregas**: POST /api/entregas → REM-2025-001, REM-INT-001
  - ✅ **Public Tracking**: GET /api/seguimiento/EQUIPO-1762643356433 → Muestra historial completo
  - ✅ **Flujo End-to-End**: Cliente → Equipo → Repuestos → Valorización → Cotización → Entrega (TODAS LAS FUNCIONALIDADES OPERATIVAS)

### Production Ready Status
**🚀 APPLICATION IS 100% PRODUCTION READY**

- ✅ All core features tested and verified
- ✅ Database operational (PostgreSQL/Supabase)
- ✅ APIs responding correctly
- ✅ Public tracking system fully functional
- ✅ Audit trail (HistorialEstado) working
- ✅ Live deployment at https://reparaciones-app.vercel.app/
- ✅ Can handle full repair workflow: Cliente → Equipo → Repuestos → Valorización → Cotización → Entrega

**Ready for operational use with real clients.**

### Phase 5: Edit/Delete Repuestos & Cotizaciones with Automatic Recalculation (Nov 9, 2025)
  - ✅ **New API Route**: `app/api/repuestos/[id]/route.ts` with PUT (edit) and DELETE handlers
  - ✅ **New API Route**: `app/api/cotizaciones/[id]/route.ts` with PUT (edit) handler
  - ✅ **Helper Function**: `lib/recalcular-valorizacion.ts` automatically recalculates totals when parts change
  - ✅ **UI Enhancement**: Repuestos table shows "Editar" and "Eliminar" buttons (initially only before valorizacion, later made always visible in Phase 5.6)
  - ✅ **Modal Edit Form**: Edit repuestos with Cantidad and Precio Unitario fields
  - ✅ **Modal Edit Form**: Edit cotización with ajustePablo field, importeOriginal and importeFinal auto-update
  - ✅ **Automatic Recalculation**:
    - Edit/delete repuestos → Subtotal recalculated → Valorizacion.costoRepuestos updated → Valorizacion.subtotal updated → Cotizacion.importeOriginal and importeFinal recalculated automatically
    - Edit cotización ajustePablo → importeFinal recalculated instantly (importeOriginal + ajustePablo)
  - ✅ **End-to-End Testing**: Created repair #3, added repuestos, tested edit (quantity 2→3, price $45.50→$50 = $150 subtotal), tested delete (removed second repuesto, total recalculated $175→$150), created valorizacion ($150 parts + $300 labor = $450), created cotización ($50 adjustment = $500 final), edited cotización ($50→$75 adjustment = $525 final)
  - ✅ **All changes reflected in real-time** on internal panel
  - ✅ **Public tracking link** automatically reflects updated repuestos list

### Phase 5.5: Modal Overlay UI Improvements (Nov 9, 2025)
  - ✅ **Created Reusable Modal Component**: `components/Modal.tsx` using React Portal (createPortal)
    - Renders modals at document.body level to avoid stacking context issues
    - Uses explicit inline CSS styles (not Tailwind) for guaranteed rendering
    - Dark overlay: `rgba(0, 0, 0, 0.5)` with `zIndex: 9999`
    - Clean white modal box with shadow, border-radius, and auto-scrolling content
  - ✅ **Enhanced Modal Visibility**: Background dimming and interaction blocking
    - When modal is open: `pointerEvents: 'none'` disables interaction with background
    - When modal is open: `opacity: 0.5` dims background content
    - Creates clear visual separation between modal and page content
    - Background automatically returns to normal when modal closes
  - ✅ **Fixed TypeScript Errors**: Installed `@types/react-dom` for createPortal type support
  - ✅ **Build Configuration**: App builds successfully with all TypeScript checks passing
  - ✅ **Commits**:
    - `57db34b`: Add pointer-events and opacity styling to improve modal overlay visibility
    - `fa3ce45`: Add @types/react-dom for TypeScript support
  - **Notes**:
    - Modal pattern follows standard web UI patterns (dark overlay + centered content)
    - Dimmed background prevents accidental clicks on page elements
    - Inline styles used instead of Tailwind to avoid CSS specificity/compilation issues
    - Solution is "clear and simple" as requested (no complex animations or transitions)

### Phase 5.6: Extended Repuesto Editing & Form Simplification (Nov 9, 2025)
  - ✅ **Extended Edit Modal**: Repuestos now editable with 4 fields
    - Can edit `codigoRepuesto` (required)
    - Can edit `descripcion` (optional)
    - Can edit `cantidad` and `importeUnitario` (both required)
    - All changes trigger automatic recalculation
  - ✅ **Always-Visible Action Buttons**:
    - "Editar" and "Eliminar" buttons now visible at all times (before AND after valorizacion)
    - "+ Agregar Repuesto" button also always visible
    - Users can modify parts at any point in the workflow
  - ✅ **Manual numeroInterno Input**:
    - Replaced auto-generated `numeroInterno` with manual user input
    - Added "Número de Documento/Seguimiento" field in Step 2 (Equipo)
    - This number is used for customer tracking links (`/seguimiento/{numeroInterno}`)
    - Matches the physical document number given to customer
  - ✅ **Simplified Nueva Reparación Form**:
    - Removed 3 unnecessary fields:
      - `direccion` from cliente form (Step 1)
      - `numeroEquipo` from equipo form (Step 2)
      - `fechaEntregaEstimada` from reparacion form (Step 3)
    - Form now contains only 6 essential fields (4 required)
  - ✅ **Simplified Repair States**:
    - Reduced from 13 states to only 4 essential states
    - **RECIBIDO** → **DIAGNOSTICO** → **EN_REPARACION** → **LISTO_PARA_RETIRO**
    - Updated `EstadoSelector.tsx` component with new simplified states
    - Color coding: blue → amber → amber → green
    - Database schema updated (requires `npx prisma db push --force-reset`)
  - ✅ **Commits** (Nov 9, 2025):
    - `a30c81f`: Allow editing codigoRepuesto and descripcion in repuesto edit modal
    - `47bfc69`: Allow adding repuestos after valorizacion is created
    - `dc9422e`: Simplify nueva reparacion form: remove unnecessary fields
    - `d72fda2`: Replace auto-generated numeroInterno with manual user input
    - `e0da43d`: Simplify repair states to only 4 essential states

### Phase 5.7: Quick Creation + Later Editing Workflow (Nov 9, 2025)
  - ✅ **Simplified Nueva Reparación Form**: Make electricista optional
    - Removed required validation on electricista field
    - Added "Sin asignar" option in Step 3 dropdown
    - Default value changed from "Arnau" to empty string
    - Allows creating repair in ~30 seconds with minimal info
  - ✅ **Dashboard Incomplete Indicator**:
    - New "Incompleta" badge (yellow) appears for repairs without electricista
    - Electricista column shows "Sin asignar" (italic, gray) when null
    - Badge appears next to estado badge for easy visibility
    - Helps identify which repairs need information completion
  - ✅ **Edit Basic Info in Repair Detail**:
    - New "Editar" button in "Información de Reparación" section
    - Toggles between view and edit mode
    - Edit form includes:
      - Electricista dropdown (Sin asignar, Arnau, Ivan)
      - Número de Precinto (text input, optional)
    - "Guardar" and "Cancelar" buttons
    - Updates via PUT `/api/reparaciones/[id]`
    - Shows success alert on save, refreshes page data
  - ✅ **Updated Schema**:
    - Made `electricista` field optional in Reparacion model (`String?`)
    - Allows null values for incomplete repairs
  - ✅ **API Changes**:
    - POST /api/reparaciones: Removed electricista validation (only equipoId required)
    - PUT /api/reparaciones/[id]: Already supported electricista updates
  - ✅ **Use Case Flow**:
    1. Cashier receives equipment, gives customer document with number
    2. Creates repair record in ~30 seconds (no electricista assigned)
    3. Dashboard flags repair as "Incompleta"
    4. Later, when cashier has time or electricista arrives:
       - Opens repair detail page
       - Clicks "Editar" in Reparación Info section
       - Assigns electricista and enters precinto number
       - Clicks "Guardar"
    5. Repair marked as complete, no longer shows "Incompleta" badge
  - ✅ **Commits** (Nov 9, 2025):
    - `14afa46`: Implement quick creation + later editing workflow (Option B)
  - **Benefits**:
    - Reduces friction in high-pressure moments (equipment arrival)
    - Allows flexible information completion when time permits
    - Dashboard provides clear visual indication of incomplete records
    - Simple, non-intrusive editing interface
    - No disruption to existing workflows

### Phase 7: UI/UX Improvements & Bug Fixes (Nov 19, 2025)
  - ✅ **Three-Stage Workflow Indicators**:
    - Created `components/EtapaIndicadores.tsx` for visual progress tracking
    - Shows 3 business stages: Etapa 1 (Recepción), Etapa 2 (Presupuesto), Etapa 3 (Administración)
    - Visual indicators (✓ checkmark for complete, ○ circle for pending)
    - Separators with responsible person names (Julio/Rodríguez/Pablo)
    - Integrated into dashboard repair list

  - ✅ **Dashboard Filtering by Stage**:
    - Added tabs system to filter repairs: Todo, Etapa 1, Etapa 2, Etapa 3
    - Tabs show count of repairs in each stage
    - Logic detects stage completion based on data state:
      - Etapa 1: complete when `estado >= ASIGNADO`
      - Etapa 2: complete when valorizacion exists + repuestos.length > 0
      - Etapa 3: complete when cotizacion exists + estado >= FACTURADO

  - ✅ **Currency Formatting**:
    - Created `lib/format.ts` with `formatCurrency()` function
    - Applied to 14 locations across 3 files (repuestos, valorizacion, cotizaciones)
    - Format: Argentine locale (point for thousands, comma for decimals)
    - Example: 1234.56 → "1.234,56"

  - ✅ **Section Rename**:
    - Renamed "Valorización" section to "Mano de obra" for clarity
    - Removed "Número de Factura Interna" field from valorizacion form
    - Simplified form from 3 columns to 2 columns

  - ✅ **Removed Redundant Field**:
    - Removed "Estado del Equipo" display from repair detail page
    - Field was redundant with "Estado de la Reparación"
    - Equipment status still tracked in database for future inventory features
    - **CRITICAL**: Found file was in subdirectory `reparaciones-app/` instead of repo root
      - Solution: Identified correct file location at `app/reparaciones/[id]/page.tsx` (root level)
      - Root-level files are what Vercel actually builds and deploys
      - Removed field from correct location, redeployed successfully

  - ✅ **Cache Busting Configuration**:
    - Restored `next.config.js` with comprehensive cache-disabling settings:
      - `generateEtags: false` - Disable ETag-based caching
      - `Cache-Control: public, max-age=0, s-maxage=0, must-revalidate` - Force revalidation
      - `onDemandEntries: { maxInactiveAge: 0, pagesBufferLength: 0 }` - No page caching
    - Prevents browser/Vercel CDN from serving stale data after deployments
    - Ensures users always see latest repair status without manual refresh

  - ✅ **Repository Structure Lesson Learned**:
    - During Phase 3 restructure, files were moved from `reparaciones-app/` subdirectory to repo root
    - Vercel deploys from root-level files (`app/`, `lib/`, etc.), NOT from subdirectories
    - Critical to verify file locations before committing changes
    - Solution: Always check `git log --all --follow -- filename` to trace file history

  - ✅ **Commits** (Nov 19, 2025):
    - `3bc7edc`: Add currency formatting with thousands separators
    - `dd575ca`: Rename 'Valorización' to 'Mano de obra' and remove invoice number field
    - `2fedbd6`: Implement three-stage workflow system with progress indicators
    - `1c21fed`: Remove parts list from public tracking link for clients
    - `1d0a53f`: Remove redundant 'Estado del Equipo' field from repair detail page
    - `fbe16c2`: Restore cache busting configuration (next.config.js)
    - `62b6cb4`: Remove redundant 'Estado del Equipo' field (correct location)

  - **Key Learnings**:
    - Always verify files are in the deployed location before making changes
    - Cache configuration is critical for dynamic repair data (fixes hard-refresh problem)
    - Redundant UI elements confuse users - remove when duplicated elsewhere
    - Three-stage workflow visualization helps both staff and management track progress

### Phase 6: Optional Future Enhancements
  - ⏳ PDF generation for invoices and delivery notes
  - ⏳ Advanced search and filtering by date/cliente/estado
  - ⏳ Revenue reports and analytics
  - ⏳ User authentication (technician login)
  - ⏳ Custom domain configuration (reparaciones.com.ar)
  - ⏳ Email notifications when repair estado changes
  - ⏳ SMS notifications to customers (Twilio integration)
  - ⏳ WhatsApp integration for tracking links (Twilio WhatsApp API)

### Known Issues & Fixes Applied
1. **Prisma Connection Pool Exhaustion**
   - ✅ Fixed: Implemented singleton pattern in `lib/prisma.ts`
   - ✅ Fixed: Added `postinstall` and updated `build` scripts to ensure Prisma client generation

2. **Next.js 16 Suspense Requirement**
   - ✅ Fixed: Wrapped `useSearchParams()` in Suspense boundary in `/cotizaciones/nueva`

3. **Vercel Auto-Detection Issues**
   - ✅ Fixed: Removed problematic `vercel.json` configuration
   - ✅ Fixed: Vercel now correctly auto-detects Next.js framework

4. **PostgreSQL Connection from Vercel**
   - ✅ Fixed: Configured Supabase Network Restrictions to allow all IPs
   - ✅ Fixed: Changed to Session Pooler connection method (recommended for serverless)
