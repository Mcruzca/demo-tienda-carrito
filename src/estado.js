// Variables del shell (window.tiendaEstado): igv es solo lectura, descuento se puede cambiar.
// El carrito siempre corre dentro del shell: él es quien las comparte.
export const estado = () => window.tiendaEstado;

// Subtotal → menos descuento → más IGV.
export function calcularTotales(items) {
 const subtotal = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
 const descuento = subtotal * estado().get('descuento') / 100;
 const igv = (subtotal - descuento) * estado().get('igv') / 100;
 return { subtotal, descuento, igv, total: subtotal - descuento + igv };
}
