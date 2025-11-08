-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reparacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipoId" INTEGER NOT NULL,
    "electricista" TEXT NOT NULL,
    "precintoNumero" TEXT,
    "fechaAsignacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntregaEstimada" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'RECIBIDO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reparacion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reparacion" ("createdAt", "electricista", "equipoId", "estado", "fechaAsignacion", "fechaEntregaEstimada", "id", "precintoNumero", "updatedAt") SELECT "createdAt", "electricista", "equipoId", "estado", "fechaAsignacion", "fechaEntregaEstimada", "id", "precintoNumero", "updatedAt" FROM "Reparacion";
DROP TABLE "Reparacion";
ALTER TABLE "new_Reparacion" RENAME TO "Reparacion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
