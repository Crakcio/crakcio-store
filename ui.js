// ui.js
import {
  obtenerMasVendidos,
  obtenerMasRecientes,
  obtenerUrlImagen,
  obtenerProductos
} from "./products.js";
import {
  formatearPrecio,
  mostrarAlerta,
  guardarEnLocalStorage,
  obtenerDeLocalStorage,
  limpiarContenedor
} from './helpers.js';
// Función auxiliar para obtener la URL de imagen desde Supabase

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

// Mostrar productos genéricos
export function mostrarProductos(productos, contenedorId, categoriaFiltro = "") {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  console.log(producto);
  contenedor.innerHTML = "";

  productos
    .filter(producto =>
      categoriaFiltro === "" ||
      (producto.categoria || "").toLowerCase() === categoriaFiltro.toLowerCase()
    )
    .forEach(producto => {
      const div = document.createElement("div");
      div.classList.add("producto");

      // ✅ Aquí agregamos la imagen correctamente
    const img = document.createElement("img");
        img.src = obtenerUrlImagen(producto.imagen);
        img.alt = producto.nombre;
        img.classList.add("producto-img");
        div.appendChild(img); // ✅ Aquí corregimos de "card" a "div"


      const nombre = document.createElement("h3");
      nombre.textContent = producto.nombre;
      div.appendChild(nombre);

      const precio = document.createElement("p");
      precio.textContent = `S/ ${producto.precio}`;
      div.appendChild(precio);

      const stock = document.createElement("p");
      stock.textContent = `Stock: ${producto.stock ?? 0}`;
      div.appendChild(stock);

      const boton = document.createElement("button");
      boton.textContent = "Agregar al carrito";
      boton.addEventListener("click", () => {
        agregarAlCarrito(producto);
      });
      div.appendChild(boton);

      contenedor.appendChild(div);
    });
}

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
