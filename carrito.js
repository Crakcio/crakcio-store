// carrito.js

export function agregarAlCarrito(producto) {
  const carrito = obtenerCarritoDesdeStorage();
  const productoExistente = carrito.find(p => p.id === producto.id);

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    producto.cantidad = 1;
    carrito.push(producto);
  }

  guardarCarrito(carrito);
  actualizarContadorCarrito();
  mostrarCarrito();
}
export function agregarAlCarrito(producto) {
  const carrito = obtenerCarritoDesdeStorage();
  const productoExistente = carrito.find(p => p.id === producto.id);

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    producto.cantidad = 1;
    carrito.push(producto);
  }
export function obtenerCarritoDesdeStorage() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

export function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function actualizarContadorCarrito() {
  const carrito = obtenerCarritoDesdeStorage();
  const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
  const contador = document.getElementById("cart-count");
  if (contador) {
    contador.textContent = total;
  }
}

export function mostrarCarrito() {
  const carrito = obtenerCarritoDesdeStorage();
  const contenedor = document.getElementById("carrito-contenido");
  const totalSpan = document.getElementById("total-carrito");

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

// Esta función necesita ser accesible globalmente para el botón onclick
window.eliminarProducto = function (id) {
  let carrito = obtenerCarritoDesdeStorage();
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito(carrito);
  actualizarContadorCarrito();
  mostrarCarrito();
}
