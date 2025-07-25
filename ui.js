const SUPABASE_URL = 'https://twznikjjvtoedfaxbuvf.supabase.co';
const BUCKET = 'imagenes'; // o el nombre de tu bucket
const RUTA = 'luces-rgb.webp'; // la ruta que guardaste

const urlPublica = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${RUTA}`;

export let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

export function agregarAlCarrito(producto) {
  const index = carrito.findIndex(p => p.id === producto.id);
  if (index > -1) {
    carrito[index].cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
}

export function mostrarCarrito() {
  document.getElementById('modal-carrito').style.display = 'block';
  renderizarCarrito();
}

export function cerrarCarrito() {
  document.getElementById('modal-carrito').style.display = 'none';
}

export function actualizarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  document.getElementById('contador-carrito').innerText = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  renderizarCarrito();
}

function renderizarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const total = document.getElementById('total-carrito');
  lista.innerHTML = '';

  if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito está vacío.</p>";
    total.innerText = "Total: S/ 0.00";
    return;
  }

  let totalPrecio = 0;
  carrito.forEach(p => {
    totalPrecio += p.precio * p.cantidad;
    const div = document.createElement('div');
    div.classList.add('item-carrito');
    div.innerHTML = `
      <p><strong>${p.nombre}</strong> (x${p.cantidad}) - S/ ${(p.precio * p.cantidad).toFixed(2)}</p>
      <button onclick="eliminarDelCarrito(${p.id})">Eliminar</button>
    `;
    lista.appendChild(div);
  });

  const btnVaciar = document.createElement("button");
  btnVaciar.innerText = "Vaciar carrito";
  btnVaciar.onclick = () => {
    carrito = [];
    actualizarCarrito();
  };
  lista.appendChild(btnVaciar);
  total.innerText = `Total: S/ ${totalPrecio.toFixed(2)}`;
}

export function validarFormulario() {
  const nombre = document.getElementById("nombreCliente").value.trim();
  const telefono = document.getElementById("telefonoCliente").value.trim();
  const direccion = document.getElementById("direccionCliente").value.trim();

  if (!nombre || !telefono || !direccion) {
    alert("Por favor, completa todos los campos obligatorios.");
    return false;
  }
  if (!/^[9]\d{8}$/.test(telefono)) {
    alert("Número de teléfono inválido.");
    return false;
  }
  return true;
}

export function enviarPedidoWhatsApp() {
  const nombre = document.getElementById("nombreCliente").value;
  const direccion = document.getElementById("direccionCliente").value;
  const telefono = document.getElementById("telefonoCliente").value;
  const metodoPago = document.getElementById("metodoPago").value;
  const notas = document.getElementById("notasCliente").value;

  let mensaje = "*🛒 Nuevo pedido desde Crackio Store*%0A";
  mensaje += `👤 *Nombre:* ${nombre}%0A`;
  mensaje += `📞 *Teléfono:* ${telefono}%0A`;
  mensaje += `📍 *Dirección:* ${direccion}%0A`;
  mensaje += `💳 *Método de pago:* ${metodoPago}%0A`;
  if (notas) mensaje += `📝 *Notas:* ${notas}%0A`;

  mensaje += `%0A*Productos:*%0A`;
  carrito.forEach((item, index) => {
    mensaje += `${index + 1}. ${item.nombre} x${item.cantidad} - S/ ${item.precio}%0A`;
  });

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  mensaje += `%0A💵 *Total:* S/ ${total.toFixed(2)}`;

  const numeroWhatsApp = "51999207025";
  const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
  window.open(url, "_blank");
}
export function mostrarProductos(productos, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const imagenURL = producto.imagen.includes("https://")
      ? producto.imagen
      : `https://twznikjjvtoedfaxbuvf.supabase.co/storage/v1/object/public/imagenes/${producto.imagen}`;

    const div = document.createElement("div");
    div.classList.add("producto");

    div.innerHTML = `
      <img src="${imagenURL}" alt="${producto.nombre}" />
      <h3>${producto.nombre}</h3>
      <p>S/ ${producto.precio.toFixed(2)}</p>
      <button>Agregar al carrito</button>
    `;

    contenedor.appendChild(div);
  });
}


