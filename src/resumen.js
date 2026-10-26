// PIEZA COMPARTIDA del módulo carrito: <tienda-resumen-carrito>.
// Es del carrito (él es el dueño), pero se muestra dentro de otros módulos: Compras y Pedidos.
// JavaScript del navegador: sin imports de Angular.
const API = '/api'; // API local de demo (repo api-java).

// CONTRATO entre módulos (eventos en window):
//   escucha → 'tienda:agregar'          detail: { id, nombre, precio }   (lo lanza compras)
//   lanza   → 'tienda:carrito-cambio'   detail: { cantidad }             (lo escucha el contador)
class ResumenCarrito extends HTMLElement {
 constructor() { super(); this.attachShadow({ mode: 'open' }); }
 connectedCallback() {
   this.control?.abort();
   this.control = new AbortController();
   this.shadowRoot.innerHTML = `
     <style>:host {display:block} aside {border:2px dashed #087f8c;padding:16px;border-radius:8px;background:#f0fbfc}
       ul {padding-left:18px;margin:8px 0} a {color:#087f8c;font-weight:700}</style>
     <aside><small>WEB COMPONENT DEL MÓDULO CARRITO · JS · localhost:4502</small><h3>Tu carrito</h3>
     <ul id="lista"></ul><p><b id="total">Cargando…</b></p>
     <a href="/carrito">Ver carrito completo →</a>
     <p id="estado" aria-live="polite"></p></aside>`;
   // Comunicación entre módulos: escucha el aviso de compras y guarda en la API.
   window.addEventListener('tienda:agregar', e => this.pedir('POST', e.detail), { signal: this.control.signal });
   this.pedir('GET');
 }
 disconnectedCallback() { this.control?.abort(); }

 async pedir(method, producto) {
   try {
     const respuesta = await fetch(API + '/carrito', {
       method,
       headers: { 'Content-Type': 'application/json' },
       body: producto ? JSON.stringify(producto) : undefined
     });
     if (!respuesta.ok) throw new Error();
     this.dibujar(await respuesta.json());
     this.shadowRoot.querySelector('#estado').textContent = '';
   } catch {
     this.shadowRoot.querySelector('#estado').textContent = 'API apagada: el carrito no se pudo guardar.';
   }
 }
 dibujar(items) {
   this.shadowRoot.querySelector('#lista').replaceChildren(...items.map(item => {
     const li = document.createElement('li');
     li.textContent = item.cantidad + ' × ' + item.nombre;
     return li;
   }));
   const cantidad = items.reduce((suma, item) => suma + item.cantidad, 0);
   const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
   this.shadowRoot.querySelector('#total').textContent = cantidad ? cantidad + (cantidad === 1 ? ' producto' : ' productos') + ' · S/ ' + total.toFixed(2) : 'Vacío';
   window.dispatchEvent(new CustomEvent('tienda:carrito-cambio', { detail: { cantidad } }));
 }
}
if (!customElements.get('tienda-resumen-carrito')) customElements.define('tienda-resumen-carrito', ResumenCarrito);
