// ui.js
import {
  obtenerMasVendidos,
  obtenerMasRecientes,
  obtenerProductos
} from "./products.js";
import {
  formatearPrecio,
  mostrarAlerta,
  guardarEnLocalStorage,
  obtenerDeLocalStorage,
  limpiarContenedor
} from './helpers.js';

// Mostrar productos más vendidos
async function mostrarProductosMasVendidos() {
  const productos = await obtenerMasVendidos();
  mostrarProductos(productos, "productos-mas-vendidos");
}

// Mostrar productos más recientes
async function mostrarProductosMasRecientes() {
  const productos = await obtenerMasRecientes();
  mostrarProductos(productos, "productos-mas-recientes");
}

// Mostrar todos los productos (opcional, si tienes una vista de todos)
async function mostrarTodosLosProductos() {
  const productos = await obtenerProductos();
  mostrarProductos(productos, "contenedor-productos");
}

// Ejecutar funciones al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  await mostrarProductosMasVendidos();
  await mostrarProductosMasRecientes();
  // await mostrarTodosLosProductos(); // Si deseas mostrar todos también
});

export function mostrarCarrito(carrito, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  carrito.forEach((producto, index) => {
    const item = document.createElement("div");
    item.classList.add("carrito-item");
    item.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div>
        <h4>${producto.nombre}</h4>
        <p>S/ ${producto.precio.toFixed(2)}</p>
        <button class="eliminar-producto" data-index="${index}">Eliminar</button>
      </div>
    `;
    contenedor.appendChild(item);
  });
}

export function actualizarContadorCarrito(cantidad) {
  const contador = document.getElementById("contador-carrito");
  if (contador) contador.textContent = cantidad;
}

export function mostrarMensaje(mensaje, tipo = "info") {
  const mensajeDiv = document.createElement("div");
  mensajeDiv.className = `mensaje ${tipo}`;
  mensajeDiv.textContent = mensaje;
  document.body.appendChild(mensajeDiv);

  setTimeout(() => {
    mensajeDiv.remove();
  }, 3000);
}
