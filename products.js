// products.js
import { supabase } from './supabaseClient.js';

const contenedor = document.getElementById("productos-destacados");

export async function cargarProductosDestacados() {
  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, descripcion, precio, imagen, mas_vendido")
    .eq("mas_vendido", true);

  if (error) {
    console.error("Error al obtener productos:", error);
    return;
  }

  contenedor.innerHTML = "";

  data.forEach(producto => {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("producto-item");

    const imagenURL = producto.imagen
      ? `https://twznikjjvtoedfaxbuvf.supabase.co/storage/v1/object/public/imgproductos/${producto.imagen}`
      : `images/${producto.imagen}`;

    tarjeta.innerHTML = `
      <img src="${imagenURL}" alt="${producto.nombre}" onerror="this.onerror=null;this.src='images/${producto.imagen}'">
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <span>S/ ${producto.precio.toFixed(2)}</span>
      <button data-id="${producto.id}" class="btn-agregar">Agregar al carrito</button>
    `;

    contenedor.appendChild(tarjeta);
  });
}

// Ejecutar al cargar el script
document.addEventListener("DOMContentLoaded", cargarProductosDestacados);
