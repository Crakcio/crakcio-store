// iluminacion.js
import { mostrarProductos, cargarProductosPorCategoria } from '../products.js';


document.addEventListener('DOMContentLoaded', async () => {
  const productos = await cargarProductosPorCategoria("iluminacion");
  mostrarProductos(productos, "contenedor-productos");
});

