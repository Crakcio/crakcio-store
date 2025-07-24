
import { supabase } from './app.js';
import { agregarAlCarrito } from './ui.js';
const baseUrl = "https://twznikjjvtoedfaxbuvf.supabase.co/storage/v1/object/public/imgproductos";
const img.src = `${baseUrl}/${producto.imagen}`;

export const productos = [
  {
    id: 1,
    nombre: "Luces LED RGB",
    precio: 30.00,
    imagen: "images/luces-rgb.webp",
  },
  {
    id: 2,
    nombre: "Luces LED RGB Inteligente",
    precio: 50.00,
    imagen: "images/luces-rgbit.webp",
  },
  {
    id: 3,
    nombre: "Enchufe Inteligente",
    precio: 40.00,
    imagen: "images/enchufe-inteligente.webp",
  },
  {
    id: 4,
    nombre: "Webcam HD",
    precio: 59.9,
    imagen: "images/webcam1.jpg",
  }
];

// products.js

// Asegúrate de que 'supabase' ya está declarado en app.js o supabaseClient.js

const contenedorId = "contenedor-productos";
const contenedor = document.getElementById(contenedorId);
const baseImgUrl = "https://twznikjjvtoedfaxbuvf.supabase.co/storage/v1/object/public/imgproductos";

async function cargarProductos() {
  try {
    const { data, error } = await supabase.from("productos").select("*");

    if (error) {
      console.error("Error al obtener productos:", error.message);
      return;
    }

    if (!contenedor) {
      console.error(`No se encontró el contenedor con id '${contenedorId}'`);
      return;
    }

    contenedor.innerHTML = "";

    data.forEach((producto) => {
      const card = document.createElement("div");
      card.classList.add("producto-card");

      const img = document.createElement("img");
      img.src = `${baseImgUrl}/${producto.imagen}`; // <- Construcción limpia
      img.alt = producto.nombre;
      img.onerror = () => {
        img.src = "img/error-img.jpg"; // Imagen por defecto si falla (opcional)
      };

      const nombre = document.createElement("h3");
      nombre.textContent = producto.nombre;

      const descripcion = document.createElement("p");
      descripcion.textContent = producto.descripcion || "Sin descripción";

      const precio = document.createElement("p");
      precio.classList.add("precio");
      precio.textContent = `S/ ${producto.precio.toFixed(2)}`;

      card.appendChild(img);
      card.appendChild(nombre);
      card.appendChild(descripcion);
      card.appendChild(precio);

      contenedor.appendChild(card);
    });
  } catch (err) {
    console.error("Error inesperado al cargar productos:", err);
  }
}

// Ejecutar la carga de productos cuando se cargue el DOM
document.addEventListener("DOMContentLoaded", cargarProductos);

import { supabase } from './supabaseClient.js';

export async function obtenerProductos() {
  const { data, error } = await supabase.from("productos").select("*");

  if (error) {
    console.error("Error al obtener productos:", error.message);
    return [];
  }

  return data;
}
