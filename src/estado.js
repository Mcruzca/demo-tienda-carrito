// Variables del shell (window.tiendaEstado): igv es solo lectura, descuento se puede cambiar.
// Si el carrito se abre sin shell, usa valores por defecto para que siga funcionando.
const porDefecto = { igv: 18, descuento: 0 };
export const estado = () => window.tiendaEstado ?? {
 get: clave => porDefecto[clave],
 set: (clave, valor) => { porDefecto[clave] = valor; window.dispatchEvent(new CustomEvent('tienda:estado-cambio', { detail: { clave, valor } })); }
};

// Subtotal → menos descuento → más IGV.
export function calcularTotales(items) {
 const subtotal = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
 const descuento = subtotal * estado().get('descuento') / 100;
 const igv = (subtotal - descuento) * estado().get('igv') / 100;
 return { subtotal, descuento, igv, total: subtotal - descuento + igv };
}
