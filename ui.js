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
  contenedor.innerHTML = "";

  productos
    .filter(producto =>
      categoriaFiltro === "" ||
      (producto.categoria || "").toLowerCase().includes(categoriaFiltro.toLowerCase())
    )
    .forEach(producto => {
      const card = document.createElement("div");
      card.classList.add("producto");

      // Aquí va lo que preguntaste
      const imagen = document.createElement("img");
      imagen.src = producto.imagen || obtenerUrlImagen(producto.imagen_url);
      imagen.alt = producto.nombre;
      imagen.classList.add("producto-img");
      
      const nombre = document.createElement("h3");
      nombre.textContent = producto.nombre;

      const precio = document.createElement("p");
      precio.textContent = `S/ ${producto.precio}`;

      const boton = document.createElement("button");
      boton.textContent = "Agregar al carrito";
      boton.addEventListener("click", () => agregarAlCarrito(producto));

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
function agregarAlCarrito(producto) {
  const carrito = obtenerDeLocalStorage("carrito") || [];

  const productoExistente = carrito.find(item => item.id === producto.id);
  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarEnLocalStorage("carrito", carrito);
  actualizarContadorCarrito();
  mostrarAlerta("Producto agregado al carrito", "success");
}

function actualizarContadorCarrito() {
  const carrito = obtenerDeLocalStorage("carrito") || [];
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    contador.textContent = totalItems;
    contador.style.display = totalItems > 0 ? "inline-block" : "none";
  }
}


export function mostrarCarrito() {
  const carrito = obtenerDeLocalStorage("carrito") || [];
  const contenedor = document.getElementById("contenido-carrito");
  const total = document.getElementById("total-carrito");

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    total.textContent = "Total: S/ 0.00";
    return;
  }

  let totalCarrito = 0;

  carrito.forEach((producto, index) => {
    const item = document.createElement("div");
    item.classList.add("item-carrito");

    const nombre = document.createElement("p");
    nombre.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.textContent = `Precio: S/ ${producto.precio}`;

    const cantidad = document.createElement("p");
    cantidad.textContent = `Cantidad: ${producto.cantidad}`;

    const subtotal = document.createElement("p");
    const subTotalValor = producto.precio * producto.cantidad;
    subtotal.textContent = `Subtotal: S/ ${subTotalValor.toFixed(2)}`;

    const eliminarBtn = document.createElement("button");
    eliminarBtn.textContent = "Eliminar";
    eliminarBtn.addEventListener("click", () => {
      carrito.splice(index, 1);
      guardarEnLocalStorage("carrito", carrito);
      mostrarCarrito();
      actualizarContadorCarrito();
    });

    item.appendChild(nombre);
    item.appendChild(precio);
    item.appendChild(cantidad);
    item.appendChild(subtotal);
    item.appendChild(eliminarBtn);

    contenedor.appendChild(item);

    totalCarrito += subTotalValor;
  });

  total.textContent = `Total: S/ ${totalCarrito.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
});
document.addEventListener("DOMContentLoaded", () => {
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

