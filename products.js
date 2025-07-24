
import { supabase } from './app.js';
import { agregarAlCarrito } from './ui.js';
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

export async function cargarProductos() {
  const { data: productos, error } = await supabase.from('productos').select('*');
  if (error) return console.error("Error al cargar productos:", error);

  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const div = document.createElement("div");
    div.classList.add("producto-card");
    div.innerHTML = `
      <img class="producto-img" src="${producto.imagen_url}" alt="${producto.nombre}" />
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <p class="precio">S/ ${producto.precio.toFixed(2)}</p>
      <p class="stock">${producto.stock > 0 ? `Stock: ${producto.stock}` : '<span style="color:red">Agotado</span>'}</p>
      ${producto.stock > 0 ? `<button onclick='agregarAlCarrito(${JSON.stringify(producto)})'>Agregar al carrito</button>` : ''}
    `;
    contenedor.appendChild(div);
  });
}
