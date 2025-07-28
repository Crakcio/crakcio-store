// iluminacion.js
import { cargarProductosPorCategoria } from './products.js';

document.addEventListener('DOMContentLoaded', async () => {
  const productos = await cargarProductosPorCategoria("smart-home");
  mostrarProductos(productos);
});

function mostrarProductos(productos) {
  const container = document.getElementById('productos-container');

  if (productos.length === 0) {
    container.innerHTML = "<p>No hay productos disponibles aún.</p>";
    return;
  }

  productos.forEach(producto => {
    const div = document.createElement('div');
    div.classList.add('producto');
    div.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h2>${producto.nombre}</h2>
      <p>${producto.descripcion}</p>
      <p>S/ ${producto.precio}</p>
    `;
    container.appendChild(div);
  });
}

