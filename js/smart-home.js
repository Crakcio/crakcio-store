// iluminacion.js
import { cargarProductosPorCategoria, mostrarProductos } from './products.js';

document.addEventListener('DOMContentLoaded', async () => {
  const productos = await cargarProductosPorCategoria("smart-home");
  mostrarProductos(productos, "contenedor-productos");
});


