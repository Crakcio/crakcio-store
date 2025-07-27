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


// Muestra el número total de productos en el ícono del carrito
export function actualizarContadorCarrito() {
  const carrito = obtenerDeLocalStorage("carrito") || [];
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    contador.textContent = totalItems;
    contador.style.display = totalItems > 0 ? "inline-block" : "none";
  }
}

// Muestra los productos del carrito en el modal
export function mostrarCarrito() {
  const carrito = obtenerDeLocalStorage("carrito") || [];
  const contenedor = document.getElementById("contenedor-carrito");
  const total = document.getElementById("totalCarrito");


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
