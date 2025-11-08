# Sistema de Seguimiento de Reparaciones

MVP para gestionar reparaciones de alternadores y arranques con seguimiento completo del proceso.

## Características

- ✅ Recepción de equipos con datos de cliente
- ✅ Asignación a electricista con precinto
- ✅ Registro de repuestos utilizados
- ✅ Valorización automática de reparaciones
- ✅ Módulo de cotización (ajuste de precios por Pablo)
- ✅ Registro de entregas con remitos
- ✅ Dashboard con estado de todas las reparaciones

## Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: SQLite (Prisma ORM)
- **Herramientas**: Prisma, TypeScript

## Instalación

1. **Clonar/Descargar el proyecto**
```bash
cd reparaciones-app
```

2. **Instalar dependencias** (ya están instaladas)
```bash
npm install
```

3. **Configurar base de datos**
```bash
npm run prisma:migrate
```

## Ejecutar la Aplicación

**Desarrollo:**
```bash
npm run dev
```

Luego abre: [http://localhost:3000](http://localhost:3000)

**Producción:**
```bash
npm run build
npm start
```

## Estructura del Proyecto

```
reparaciones-app/
├── app/
│   ├── api/              # API Routes
│   │   ├── clientes/
│   │   ├── equipos/
│   │   ├── reparaciones/
│   │   ├── repuestos/
│   │   ├── valorizaciones/
│   │   ├── cotizaciones/
│   │   └── entregas/
│   ├── dashboard/        # Dashboard de reparaciones
│   ├── reparaciones/     # Crear y ver reparaciones
│   │   ├── nueva/       # Crear nueva reparación
│   │   └── [id]/        # Detalles de reparación
│   ├── cotizaciones/     # Módulo de cotización (Pablo)
│   ├── entregas/         # Entrega de equipos
│   ├── layout.tsx        # Layout raíz
│   ├── page.tsx          # Página de inicio
│   └── globals.css       # Estilos globales
├── prisma/
│   ├── schema.prisma     # Esquema de base de datos
│   └── migrations/       # Migraciones
├── components/           # Componentes reutilizables
├── lib/                  # Utilidades
├── types/                # Tipos TypeScript
└── public/               # Archivos estáticos
```

## Flujo de Trabajo

### 1. Nueva Reparación
- `página inicial` → `Nueva Reparación`
- Seleccionar o crear cliente
- Ingresar datos del equipo
- Asignar electricista y precinto

### 2. Registro de Repuestos
- `Dashboard` → Ver reparación
- Agregar repuestos utilizados
- Sistema calcula totales automáticamente

### 3. Valorización
- En detalles de reparación
- Ingresar costo de mano de obra
- Sistema suma repuestos + mano de obra

### 4. Cotización (Pablo)
- `Cotizaciones`
- Ver reparaciones pendientes
- Ajustar precio si es necesario
- Marcar como completada

### 5. Entrega
- `Entregas`
- Ver equipos listos (con cotización completada)
- Ingresar números de remitos
- Confirmar entrega

## Base de Datos

### Modelos

**Cliente**
- Nombre, empresa, teléfono, email, dirección

**Equipo**
- Descripción, número de equipo, número interno, estado

**Reparación**
- Electricista, precinto, fecha de entrega estimada, estado

**RepuestoUsado**
- Código, descripción, cantidad, precio, subtotal

**Valorizacion**
- Costo repuestos, mano de obra, subtotal, número de factura

**Cotizacion**
- Importe original, ajuste Pablo, importe final

**Entrega**
- Número de remito oficial/interno, fecha, estado

## Estados

### Equipos
- RECIBIDO
- EN_REPARACION
- REPARADO
- ENTREGADO

### Reparaciones
- EN_PROCESO
- COMPLETADA
- CANCELADA

### Cotización
- PENDIENTE
- COMPLETADA

## Próximas Mejoras

- Generación de PDF para facturas y remitos
- Búsqueda y filtros avanzados
- Historial de cambios
- Reportes de ingresos
- Autenticación de usuarios
- Sincronización con catálogo de repuestos existente

## Troubleshooting

**Error de base de datos:**
```bash
rm prisma/dev.db
npm run prisma:migrate
```

**Puerto 3000 en uso:**
```bash
npm run dev -- -p 3001
```

**Limpiar node_modules:**
```bash
rm -rf node_modules
npm install
```

## Contacto

Para soporte o mejoras, contactar al desarrollador.
