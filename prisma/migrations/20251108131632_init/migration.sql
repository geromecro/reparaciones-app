-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "direccion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "numeroEquipo" TEXT,
    "fechaRecepcion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroInterno" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'RECIBIDO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reparacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipoId" INTEGER NOT NULL,
    "electricista" TEXT NOT NULL,
    "precintoNumero" TEXT,
    "fechaAsignacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntregaEstimada" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'EN_PROCESO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reparacion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepuestoUsado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reparacionId" INTEGER NOT NULL,
    "codigoRepuesto" TEXT NOT NULL,
    "descripcion" TEXT,
    "cantidad" INTEGER NOT NULL,
    "importeUnitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RepuestoUsado_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "Reparacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Valorizacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reparacionId" INTEGER NOT NULL,
    "costoRepuestos" REAL NOT NULL DEFAULT 0,
    "manoObraElectricista" TEXT NOT NULL,
    "importeManoObra" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaValorizacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroFacturaInterna" TEXT,
    "numeroFacturaOficial" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Valorizacion_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "Reparacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valorizacionId" INTEGER NOT NULL,
    "importeOriginal" REAL NOT NULL,
    "ajustePablo" REAL NOT NULL DEFAULT 0,
    "importeFinal" REAL NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fechaCotizacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cotizacion_valorizacionId_fkey" FOREIGN KEY ("valorizacionId") REFERENCES "Valorizacion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entrega" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipoId" INTEGER NOT NULL,
    "numeroRemitoOficial" TEXT,
    "numeroRemitoInterno" TEXT,
    "fechaEntrega" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Entrega_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_numeroInterno_key" ON "Equipo"("numeroInterno");

-- CreateIndex
CREATE UNIQUE INDEX "Valorizacion_reparacionId_key" ON "Valorizacion"("reparacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Cotizacion_valorizacionId_key" ON "Cotizacion"("valorizacionId");
