// iluminacion.js
import { cargarProductosPorCategoria } from '../products.js';
import { mostrarProductos } from '../ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const productos = await cargarProductosPorCategoria("smart-home");
  mostrarProductos(productos, "contenedor-productos");
});


