// ui.js
// ui.js
export function renderizarProductos(productos, contenedorId = 'contenedor-productos') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) {
    console.warn(`No se encontró el contenedor con id: ${contenedorId}`);
    return;
  }

  contenedor.innerHTML = ''; // Limpiar el contenedor
  productos.forEach(producto => {
    const productoHTML = document.createElement('div');
    productoHTML.classList.add('producto');
    productoHTML.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" />
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <p class="precio">S/ ${producto.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito('${producto.id}')">Agregar al carrito</button>
    `;
    contenedor.appendChild(productoHTML);
  });
}

export function mostrarSeccion(id) {
  const secciones = document.querySelectorAll('section');
  secciones.forEach((seccion) => {
    seccion.style.display = 'none';
  });

  const seccionActiva = document.getElementById(id);
  if (seccionActiva) {
    seccionActiva.style.display = 'block';
  }
}

export function mostrarElemento(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

export function ocultarElemento(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

export function cambiarTexto(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

export function limpiarFormulario(idFormulario) {
  const form = document.getElementById(idFormulario);
  if (form) form.reset();
}
