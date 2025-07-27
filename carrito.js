// 📦 carrito.js - Gestión del carrito de compras

// Agrega un producto al carrito\export function agregarAlCarrito(producto) {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const productoExistente = carrito.find(p => p.id === producto.id);

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    producto.cantidad = 1;
    carrito.push(producto);
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
}

// Muestra el número total de productos en el ícono del carrito
export function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = carrito.reduce((sum, p) => sum + (p.cantidad || 1), 0);
  const contador = document.getElementById('carritoContador');
  if (contador) contador.textContent = total;
}

// Muestra los productos del carrito en el modal
export function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contenedor = document.getElementById('carritoLista');
  const totalElemento = document.getElementById('carritoTotal');

  if (!contenedor || !totalElemento) return;

  contenedor.innerHTML = '';
  let total = 0;

  carrito.forEach((producto, index) => {
    const item = document.createElement('div');
    item.className = 'carrito-item';
    item.innerHTML = `
      <span>${producto.nombre} x${producto.cantidad}</span>
      <span>S/ ${(producto.precio * producto.cantidad).toFixed(2)}</span>
      <button onclick="eliminarProductoDelCarrito(${producto.id})">❌</button>
    `;
    contenedor.appendChild(item);
    total += producto.precio * producto.cantidad;
  });

  totalElemento.textContent = `Total: S/ ${total.toFixed(2)}`;
}

// Elimina un producto por ID
export function eliminarProductoDelCarrito(idProducto) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito = carrito.filter(p => p.id !== idProducto);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  mostrarCarrito();
  actualizarContadorCarrito();
}

// Vacía todo el carrito
export function vaciarCarrito() {
  localStorage.removeItem('carrito');
  mostrarCarrito();
  actualizarContadorCarrito();
}

// Obtiene el carrito como objeto JS
export function obtenerCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}
