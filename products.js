import { supabase } from './supabaseClient.js';
import { agregarAlCarrito } from './ui.js';

const baseImgUrl = "https://twznikjjvtoedfaxbuvf.supabase.co/storage/v1/object/public/imgproductos";

async function cargarProductos() {
  try {
    const { data, error } = await supabase.from("productos").select("*");

    if (error) {
      console.error("Error al obtener productos:", error.message);
      return;
    }

    const contenedor = document.getElementById("contenedor-productos");

    if (!contenedor) {
      console.error("No se encontró el contenedor con id 'contenedor-productos'");
      return;
    }

    contenedor.innerHTML = "";

    data.forEach((producto) => {
      const card = document.createElement("div");
      card.classList.add("producto-card");

      const img = document.createElement("img");
      img.src = producto.imagen
        ? `${baseImgUrl}/${producto.imagen}`
        : "img/error-img.webp";
      img.alt = producto.nombre;
      img.onerror = () => {
        if (!img.dataset.fallback) {
          img.src = "img/error-img.webp";
          img.dataset.fallback = "true";
        }
      };

      const nombre = document.createElement("h3");
      nombre.textContent = producto.nombre;

      const descripcion = document.createElement("p");
      descripcion.textContent = producto.descripcion || "Sin descripción";

      const precio = document.createElement("p");
      precio.classList.add("precio");
      precio.textContent = `S/ ${parseFloat(producto.precio).toFixed(2)}`;

      const stock = document.createElement("p");
      stock.classList.add("stock");
      stock.textContent = `Stock: ${producto.stock ?? 0}`;

      // 🔹 Botón para agregar al carrito
      const botonAgregar = document.createElement("button");
      botonAgregar.textContent = "Agregar al carrito";
      botonAgregar.onclick = () => agregarAlCarrito(producto);

      // Agrega todo al card
      card.appendChild(img);
      card.appendChild(nombre);
      card.appendChild(descripcion);
      card.appendChild(precio);
      card.appendChild(stock);
      card.appendChild(botonAgregar);

      contenedor.appendChild(card);
    });
  } catch (err) {
    console.error("Error inesperado al cargar productos:", err);
  }
}

document.addEventListener("DOMContentLoaded", cargarProductos);

export async function obtenerProductos() {
  const { data, error } = await supabase.from("productos").select("*");

  if (error) {
    console.error("Error al obtener productos:", error.message);
    return [];
  }

  return data;
}

export { cargarProductos };
