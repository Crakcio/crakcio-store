// app.js
import { mostrarCarrito, actualizarContadorCarrito, mostrarMensaje } from './ui.js';
import { supabase } from './supabaseClient.js';

let carrito = [];

function agregarProductoAlCarrito(id, nombre, precio, imagen) {
  carrito.push({ id, nombre, precio, imagen });
  mostrarCarrito(carrito, 'carrito');
  actualizarContadorCarrito(carrito.length);
  mostrarMensaje("Producto agregado al carrito", "exito");
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  mostrarCarrito(carrito, 'carrito');
  actualizarContadorCarrito(carrito.length);
}

function enviarPedidoPorWhatsApp() {
  if (carrito.length === 0) {
    mostrarMensaje("El carrito está vacío", "error");
    return;
  }

  let mensaje = "¡Hola! Quiero hacer un pedido:%0A";
  carrito.forEach((item, i) => {
    mensaje += `${i + 1}. ${item.nombre} - S/ ${item.precio.toFixed(2)}%0A`;
  });

  const total = carrito.reduce((sum, p) => sum + p.precio, 0);
  mensaje += `%0ATotal: S/ ${total.toFixed(2)}`;
  window.open(`https://wa.me/51999207025?text=${mensaje}`, '_blank');
}

// Delegación de eventos
document.addEventListener("click", e => {
  if (e.target.classList.contains("btn-agregar")) {
    const tarjeta = e.target.closest(".producto-item");
    const nombre = tarjeta.querySelector("h3").textContent;
    const precio = parseFloat(tarjeta.querySelector("span").textContent.replace("S/", ""));
    const imagen = tarjeta.querySelector("img").src;
    const id = e.target.dataset.id;
    agregarProductoAlCarrito(id, nombre, precio, imagen);
  }

  if (e.target.classList.contains("eliminar-producto")) {
    const index = parseInt(e.target.dataset.index);
    eliminarProducto(index);
  }

  if (e.target.id === "btn-finalizar") {
    enviarPedidoPorWhatsApp();
  }
});
