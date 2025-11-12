/**
 * Formatea un número como moneda argentina con separadores de miles
 * @param value - Número a formatear
 * @returns String formateado (ej: "1.234,56")
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
