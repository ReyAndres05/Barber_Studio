export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
  
  // Limpiamos los espacios en blanco que pueda agregar el formateador (ej. "$ 35.000")
  // para que quede exactamente "$35.000 COP" como pide el requerimiento.
  return formatted.replace(/\s/g, "") + " COP";
}
