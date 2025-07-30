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
import {
  agregarAlCarrito,
  actualizarContadorCarrito,
  mostrarCarrito,
  vaciarCarrito,
  obtenerCarrito
} from './carrito.js';

// Función auxiliar para obtener la URL de imagen desde Supabase

// Mostrar productos más vendidos
export async function mostrarProductosMasVendidos() {
  const productos = await obtenerMasVendidos();
  mostrarProductos(productos, "productos-mas-vendidos");
}

// Mostrar productos más recientes
export async function mostrarProductosMasRecientes() {
  const productos = await obtenerMasRecientes();
  mostrarProductos(productos, "productos-mas-recientes");
}

// Mostrar todos los productos (opcional, si tienes una vista de todos)
export async function mostrarTodosLosProductos() {
  const productos = await obtenerProductos();
  mostrarProductos(productos, "contenedor-productos");
}

// Ejecutar funciones al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  await mostrarProductosMasVendidos();
  await mostrarProductosMasRecientes();
  actualizarContadorCarrito();
  // await mostrarTodosLosProductos(); // Si deseas mostrar todos también
 const botonCarrito = document.getElementById('boton-carrito');
  const modal = document.getElementById('modal');
  const cerrarCarrito = document.getElementById('cerrarCarrito');
const vaciarBtn = document.getElementById("vaciar-carrito");
if (vaciarBtn) {
  vaciarBtn.addEventListener("click", () => {
    guardarEnLocalStorage("carrito", []);
    mostrarCarrito();
    actualizarContadorCarrito();
  });
}

  if (botonCarrito && modal && cerrarCarrito) {
    botonCarrito.addEventListener('click', () => {
  mostrarCarrito();
  modal.classList.add('activo');
  modal.classList.remove('oculto');
});

    cerrarCarrito.addEventListener('click', () => {
      modal.classList.remove('activo');
      modal.classList.add('oculto');
    });
  }


});

// Mostrar productos genéricos
export function mostrarProductos(productos, contenedorId, categoriaFiltro = "") {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";
  if (!contenedor) {
    console.warn(`Contenedor con id "${contenedorId}" no existe. No se mostrarán productos.`);
    return; // detener ejecución
  }

  

  productos
    .filter(producto =>
      categoriaFiltro === "" ||
      (producto.categoria || "").toLowerCase().includes(categoriaFiltro.toLowerCase())
    )
                       // 🧹 Limpia productos anteriores y sus eventos
    productos.forEach(producto => {
      const card = document.createElement("div");
      card.classList.add("producto");

      const imagen = document.createElement("img");
      imagen.src = obtenerUrlImagen(producto.imagen_url || producto.imagen);
      imagen.alt = producto.nombre;
      imagen.classList.add("producto-img");

      const nombre = document.createElement("h3");
      nombre.textContent = producto.nombre;

      const precio = document.createElement("p");
      precio.textContent = `S/ ${producto.precio}`;

      const boton = document.createElement("button");
      boton.textContent = "Agregar al carrito";
      boton.classList.add("add-to-cart");
      boton.dataset.id = producto.id;
      boton.addEventListener("click", () => {
      agregarAlCarrito(producto);
      });
      card.appendChild(imagen);
      card.appendChild(nombre);
      card.appendChild(precio);
      card.appendChild(boton);

      contenedor.appendChild(card);
    });
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

export function mostrarPopupCarrito() {
  const popup = document.getElementById("popup-carrito");
  const fondo = document.getElementById("fondo-modal");

  popup.classList.remove("oculto");
  fondo.classList.remove("oculto");
}


