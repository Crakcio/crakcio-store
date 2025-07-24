// products.js

export const productos = [
  {
    id: 1,
    nombre: "Mouse Gamer RGB",
    precio: 59.90,
    imagen: "img/mouse.jpg",
  },
  {
    id: 2,
    nombre: "Teclado Mecánico",
    precio: 129.00,
    imagen: "img/teclado.jpg",
  },
  {
    id: 3,
    nombre: "Auriculares con Micrófono",
    precio: 89.90,
    imagen: "img/auriculares.jpg",
  }
  // Puedes agregar más productos aquí
];
export async function cargarProductos(contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) {
    console.error(`No se encontró el contenedor con ID "${contenedorId}"`);
    return;
  }

  try {
    const respuesta = await fetch('products.json');
    const productos = await respuesta.json();

    contenedor.innerHTML = '';
    productos.forEach(producto => {
      const productoDiv = document.createElement('div');
      productoDiv.classList.add('producto');
      productoDiv.innerHTML = `
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <span>S/ ${producto.precio}</span>
      `;
      contenedor.appendChild(productoDiv);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}


export function renderizarProductos(contenedorId = "productos") {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = ""; // Limpiar antes de insertar

  productos.forEach((producto) => {
    const card = document.createElement("div");
    card.className = "producto-card";

    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      <h3>${producto.nombre}</h3>
      <p>S/ ${producto.precio.toFixed(2)}</p>
      <button>Agregar al carrito</button>
    `;

    contenedor.appendChild(card);
  });
}
