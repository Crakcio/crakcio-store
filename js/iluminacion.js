// iluminacion.js
import { cargarProductosPorCategoria, mostrarProductos } from './products.js';

document.addEventListener('DOMContentLoaded', async () => {
  const productos = await cargarProductosPorCategoria("iluminacion");
  mostrarProductos(productos, "contenedor-productos");
});

