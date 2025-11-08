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
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 with custom minimalista theme (white/gray palette)
- **Database**: SQLite with Prisma ORM
- **State Management**: React hooks (useState, useEffect)
- **API**: Next.js Route Handlers (api/ folder)

### Design System
The application uses a **minimalista modern design** with:
- **Color Palette**: Primary grays (50-900) + accent colors (green, amber, red)
- **Reusable Components** in `/components`:
  - `Button.tsx`: 4 variants (primary, secondary, ghost, danger)
  - `Badge.tsx`: Status indicators with 5 variants
  - `Card.tsx`: Surface component with header/body/footer sections
  - `EstadoSelector.tsx`: Dropdown for repair state changes (13 states)
- **Tailwind Config**: Custom theme in `tailwind.config.js` with extended colors and shadows
- **Global Styles**: `app/globals.css` for base typography and component layers

### Data Model

**8 Core Models** (prisma/schema.prisma):

1. **Cliente**: Customer info (nombre, empresa, telefono, email, direccion)
2. **Equipo**: Equipment/device (descripcion, numeroInterno, estado)
3. **Reparacion**: Repair record (electricista, precintoNumero, estado, fechaEntregaEstimada)
4. **RepuestoUsado**: Parts used in repair (codigo, cantidad, importeUnitario, subtotal)
5. **HistorialEstado**: Audit trail (reparacionId, estadoAnterior, estadoNuevo, fechaCambio, notas)
6. **Valorizacion**: Cost breakdown (costoRepuestos, importeManoObra, subtotal)
7. **Cotizacion**: Pricing adjustment by Pablo (importeOriginal, ajustePablo, importeFinal)
8. **Entrega**: Delivery record (numeroRemitoOficial, numeroRemitoInterno, estado)

### State Progression

**Reparacion States** (13 total, organized in 5 phases):
- **Inicio** (blue): RECIBIDO → PRECINTADO → ASIGNADO
- **Trabajo** (amber): DIAGNOSTICO → EN_REPARACION → ESPERANDO_REPUESTOS
- **Administrativo** (gray): VALORIZADO → COTIZADO → APROBADO
- **Final** (green): FACTURADO → LISTO_PARA_RETIRO → ENTREGADO
- **Completo** (gray): CERRADO

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
   - Custom colors available: `primary-*`, `accent-*`, `warning-*`, `error-*`
   - Use `@layer` directives in CSS for component abstractions (see globals.css)
   - No dark mode configured (not needed for this MVP)

4. **Multi-Step Forms** (Nueva Reparación):
   - 3-step wizard: Client → Equipment → Assignment
   - Progress shown with numbered steps
   - Previous/Next buttons navigate between steps
   - Form submission happens only on final step

## Database Configuration

### Current Setup
- **Database**: PostgreSQL via Supabase
- **Connection String**: In `.env` and `.env.local`
- **Provider**: `provider = "postgresql"` in `prisma/schema.prisma`
- **Tables**: All 8 models synced (Cliente, Equipo, Reparacion, HistorialEstado, RepuestoUsado, Valorizacion, Cotizacion, Entrega)

### How to Migrate Database
If needed to reset/migrate again:
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
- Phase 1: Public tracking system with HistorialEstado audit trail
- Phase 1.5: Tracking link in internal repair panel with copy-to-clipboard
- Phase 2: Migrate from SQLite to PostgreSQL via Supabase (cloud-ready)
- Phase 3: Deploy to Vercel with PostgreSQL connection (LIVE at https://reparaciones-app-juj2.vercel.app)

### In Progress
- Phase 3: Deploy frontend to Vercel with PostgreSQL connection
- Phase 4: Configure environment variables in Vercel
- Phase 5: Final testing and domain setup
- Phase 6: Optional WhatsApp integration for tracking links

### Future Improvements
- PDF generation for invoices and delivery notes
- Advanced search and filtering by date/cliente/estado
- Revenue reports and analytics
- User authentication (technician login)
- Integration with existing parts catalog/suppliers
- Email notifications when repair estado changes
- SMS notifications to customers
- WhatsApp bot for tracking updates
