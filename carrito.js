// carrito.js

export function agregarAlCarrito(producto) {
  console.log("✅ agregarAlCarrito llamado para:", producto.nombre);
  console.trace();
  const carrito = obtenerCarrito();
  const productoExistente = carrito.find(p => p.id === producto.id);

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    const productoCopia = { ...producto, cantidad: 1 };
    carrito.push(productoCopia);

  }

  guardarCarrito(carrito);
  actualizarContadorCarrito();
  mostrarCarrito();
}
export function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

export function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    contador.textContent = total;
  }
}

export function mostrarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById("contenedor-carrito");
  const totalSpan = document.getElementById("totalCarrito");

  if (!contenedor || !totalSpan) return;

  contenedor.innerHTML = "";

  carrito.forEach(producto => {
    const div = document.createElement("div");
    div.className = "producto-carrito";
    div.innerHTML = `
      <span>${producto.nombre} x${producto.cantidad}</span>
      <span>S/ ${(producto.precio * producto.cantidad).toFixed(2)}</span>
      <button onclick="eliminarProducto(${producto.id})">❌</button>
    `;
    contenedor.appendChild(div);
  });

  const total = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  totalSpan.textContent = total.toFixed(2);
}
export function vaciarCarrito() {
  localStorage.removeItem("carrito");
  actualizarContadorCarrito();
  mostrarCarrito();
}

// Esta función necesita ser accesible globalmente para el botón onclick
window.eliminarProducto = function (id) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito(carrito);
  actualizarContadorCarrito();
  mostrarCarrito();
}
