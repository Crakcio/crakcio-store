// products.js
import { supabase } from './supabaseClient.js';

export async function obtenerProductosMasVendidos() {
  const { data, error } = await supabase
    .from('Productos')
    .select('*')
    .order('ventas', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }

  return data;
}

export function mostrarProductos(productos, contenedorId, categoriaFiltro = "") {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";

  productos
    .filter(producto =>
      categoriaFiltro === "" ||
      (producto.categoria || "").toLowerCase() === categoriaFiltro.toLowerCase()
    )
    .forEach(producto => {
      const tarjeta = document.createElement("div");
      tarjeta.classList.add("producto-item");

      const imagenUrl = producto.imagen_supabase || `images/${producto.imagen_local || 'default.jpg'}`;

      tarjeta.innerHTML = `
        <img src="${imagenUrl}" alt="${producto.nombre}" />
        <h3>${producto.nombre}</h3>
        <span>S/ ${producto.precio.toFixed(2)}</span>
        <p class="stock">Stock: ${producto.stock || 0}</p>
        <button class="btn-agregar" data-id="${producto.id}" ${producto.stock <= 0 ? 'disabled' : ''}>${producto.stock <= 0 ? 'Agotado' : 'Agregar al carrito'}</button>
      `;

      contenedor.appendChild(tarjeta);
    });
}
