// PÁGINA COMPLETA del módulo carrito: <tienda-carrito>, en su propio apartado (/carrito).
// JavaScript del navegador: sin imports de Angular.
import { estado, calcularTotales } from './estado.js';
const API = '/api'; // API local de demo (repo api-java).

// CONTRATO entre módulos (eventos en window):
//   lanza → 'tienda:carrito-cambio'   detail: { cantidad }   (lo escucha el contador)
//   lee   → igv del shell · lee y CAMBIA → descuento del shell (botón "Quitar cupón")
// No escucha 'tienda:agregar': compras está en otro apartado. Al abrir, lee de la API.
class Carrito extends HTMLElement {
 constructor() { super(); this.attachShadow({ mode: 'open' }); }
 connectedCallback() {
   this.control?.abort();
   this.control = new AbortController();
   this.shadowRoot.innerHTML = `
     <style>:host {display:block} section {border:2px solid #087f8c;padding:20px;border-radius:8px}
       ul {padding-left:18px} button {padding:8px 12px;margin-right:8px;cursor:pointer}</style>
     <section><small>JAVASCRIPT PURO · localhost:4502</small><h2>Carrito</h2>
     <ul id="lista"></ul><p id="detalle"></p><p><b id="total">Cargando…</b></p>
     <button id="finalizar">Finalizar compra</button><button id="vaciar">Vaciar carrito</button><button id="quitar-cupon">Quitar cupón</button>
     <p id="estado" aria-live="polite"></p></section>`;
   const opciones = { signal: this.control.signal };
   this.shadowRoot.querySelector('#finalizar').addEventListener('click', () => this.pedir('POST', '/pedidos', 'Compra registrada. Mírala en Pedidos.'), opciones);
   this.shadowRoot.querySelector('#vaciar').addEventListener('click', () => this.pedir('DELETE', '/carrito'), opciones);
   // Este módulo JS también modifica una variable del shell.
   this.shadowRoot.querySelector('#quitar-cupon').addEventListener('click', () => estado().set('descuento', 0), opciones);
   // Si cambia una variable del shell, se recalcula el total sin volver a la API.
   window.addEventListener('tienda:estado-cambio', () => this.dibujar(this.items ?? []), opciones);
   this.pedir('GET', '/carrito'); // Apartado distinto: los datos llegan por la API, no por eventos.
 }
 disconnectedCallback() { this.control?.abort(); }

 // Todas las rutas devuelven el carrito actualizado.
 async pedir(method, ruta, exito = '') {
   try {
     const respuesta = await fetch(API + ruta, { method });
     if (!respuesta.ok) throw new Error((await respuesta.json()).error);
     this.dibujar(await respuesta.json());
     this.mostrarEstado(exito);
   } catch (error) {
     this.mostrarEstado(error instanceof TypeError ? 'API apagada: no se pudo conectar.' : error.message);
   }
 }
 dibujar(items) {
   this.items = items;
   this.shadowRoot.querySelector('#lista').replaceChildren(...items.map(item => {
     const li = document.createElement('li');
     li.textContent = item.cantidad + ' × ' + item.nombre + ' · S/ ' + (item.precio * item.cantidad).toFixed(2);
     return li;
   }));
   const cantidad = items.reduce((suma, item) => suma + item.cantidad, 0);
   const t = calcularTotales(items);
   this.shadowRoot.querySelector('#detalle').textContent = cantidad
     ? 'Subtotal S/ ' + t.subtotal.toFixed(2) + ' · Descuento ' + estado().get('descuento') + ' % −S/ ' + t.descuento.toFixed(2) + ' · IGV ' + estado().get('igv') + ' % +S/ ' + t.igv.toFixed(2)
     : '';
   this.shadowRoot.querySelector('#total').textContent = cantidad ? 'Total: S/ ' + t.total.toFixed(2) : 'El carrito está vacío';
   window.dispatchEvent(new CustomEvent('tienda:carrito-cambio', { detail: { cantidad } }));
 }
 mostrarEstado(texto) { this.shadowRoot.querySelector('#estado').textContent = texto; }
}
if (!customElements.get('tienda-carrito')) customElements.define('tienda-carrito', Carrito);
