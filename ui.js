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

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    contador.textContent = carrito.length;
  }
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
function renderizarCarrito() {
  const contenedor = document.getElementById('carritoContainer');
  if (!contenedor) return;

  contenedor.innerHTML = '';
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  let total = 0;

  carrito.forEach((item, index) => {
    total += parseFloat(item.precio) * item.cantidad;

    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <strong>${item.nombre}</strong><br>
        Precio: S/ ${item.precio} x ${item.cantidad}<br>
        <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
      </div>
      <hr>
    `;
    contenedor.appendChild(div);
  });

  const totalElem = document.getElementById('totalCarrito');
  if (totalElem) {
    totalElem.textContent = 'Total: S/ ' + total.toFixed(2);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
});
document.addEventListener("DOMContentLoaded", () => {
  const botonCarrito = document.getElementById('boton-carrito');
  const modal = document.getElementById('modal');
  const cerrarCarrito = document.getElementById('cerrarCarrito');

  if (botonCarrito && modal && cerrarCarrito) {
    botonCarrito.addEventListener('click', () => {
      modal.classList.add('activo');
      modal.classList.remove('oculto');
    });

    cerrarCarrito.addEventListener('click', () => {
      modal.classList.remove('activo');
      modal.classList.add('oculto');
    });
  }
});

