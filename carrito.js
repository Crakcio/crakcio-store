// carrito.js

export function agregarAlCarrito(producto) {
  console.log("✅ agregarAlCarrito llamado para:", producto.nombre);
  console.trace();
  const carrito = obtenerCarrito();
  const productoExistente = carrito.find(p => p.id === producto.id);

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    const productoCopia = { ...producto, cantidad: 1 };
    carrito.push(productoCopia);

  }

  guardarCarrito(carrito);
  actualizarContadorCarrito();
  mostrarCarrito();
}
export function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

export function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  const total = carrito.reduce((sum, p) => sum + p.cantidad, 0);
  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    contador.textContent = total;
  }
}

export function mostrarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById("contenedor-carrito");
  const totalSpan = document.getElementById("totalCarrito");

  if (!contenedor || !totalSpan) return;

  contenedor.innerHTML = "";

  carrito.forEach(producto => {
    const div = document.createElement("div");
    div.className = "producto-carrito";
    div.innerHTML = `
      <span>${producto.nombre} x${producto.cantidad}</span>
      <span>S/ ${(producto.precio * producto.cantidad).toFixed(2)}</span>
      <button onclick="eliminarProducto(${producto.id})">❌</button>
    `;
    contenedor.appendChild(div);
  });

  const total = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  totalSpan.textContent = total.toFixed(2);
}
export function vaciarCarrito() {
  localStorage.removeItem("carrito");
  actualizarContadorCarrito();
  mostrarCarrito();
}

document.addEventListener('DOMContentLoaded', () => {
  const botonCarrito = document.getElementById('boton-carrito');
  const panel = document.getElementById('panel-carrito');
  const cerrarPanel = document.getElementById('cerrar-panel');
  const irAFormulario = document.getElementById('ir-a-formulario');
  const form = document.getElementById('formulario-pedido');
  const contenidoCarrito = document.getElementById('panel-contenido');

  // Mostrar panel si hay sesión (solo para index.html)
  botonCarrito.addEventListener('click', () => {
    const sesion = localStorage.getItem('usuario'); // verifica si está logueado
    if (document.body.id === "index" && !sesion) {
      alert("Debes iniciar sesión para ver tu carrito.");
      return;
    }

    panel.classList.add('visible');
    panel.classList.remove('oculto');
    mostrarResumenCarrito();
  });

  cerrarPanel.addEventListener('click', () => {
    panel.classList.remove('visible');
    setTimeout(() => panel.classList.add('oculto'), 300);
  });

  irAFormulario.addEventListener('click', () => {
    form.classList.remove('oculto');
    irAFormulario.classList.add('oculto');
  });

 
function mostrarResumenCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  if (carrito.length === 0) {
    contenidoCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  let html = "<ul>";
  carrito.forEach(item => {
    html += `<li>${item.nombre} - ${item.precio} x ${item.cantidad}</li>`;
  });
  html += "</ul>";

  
  

  contenidoCarrito.innerHTML = html;

  // 🔄 Ahora que el botón existe, podemos asignar el evento
  const btn = document.getElementById('confirmar-pedido');
  btn?.addEventListener('click', async () => {
  const direccion = document.getElementById('direccion')?.value.trim();
  const telefono = document.getElementById('telefono')?.value.trim();
  const metodo = document.getElementById('metodo-pago')?.value;
  const notas = document.getElementById('notas')?.value.trim() || '';
  const email = localStorage.getItem('email') || 'Invitado';
  const nombre_cliente = localStorage.getItem('usuario') || 'Cliente sin nombre';
  const usuario_id = localStorage.getItem('usuario_id') || null;

  if (!direccion || !telefono) {
    alert('Por favor completa dirección y teléfono.');
    return;
  }

  const carrito = obtenerCarrito();
  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  const total = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0).toFixed(2);
  const cantidad = carrito.reduce((sum, p) => sum + p.cantidad, 0);

  const resumenProductos = carrito.map(p => `${p.nombre} x${p.cantidad}`).join(', ');

  // Guardar en Supabase
  const { error } = await supabase.from('pedidos').insert([
    {
      usuario_id,
      nombre_cliente,
      telefono,
      direccion,
      metodo_pago: metodo,
      notas,
      email,
      total: parseFloat(total),
      cantidad,
      productos: resumenProductos,
      estado: 'Pendiente',
      fecha: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error('❌ Error al guardar pedido:', error.message);
    alert('Ocurrió un error al guardar el pedido.');
    return;
  }

  // WhatsApp
  const numeroCrackio = '51999207025'; // ← reemplaza con tu número de WhatsApp con código de país
  const mensaje = `🛒 Nuevo Pedido Crackio Store 🧾%0ACliente: ${nombre_cliente}%0AEmail: ${email}%0A📍 Dirección: ${direccion}%0A📞 Teléfono: ${telefono}%0A💳 Pago: ${metodo}%0A📝 Notas: ${notas || 'Ninguna'}%0A🧩 Productos: ${resumenProductos}%0ATotal: S/ ${total}`;
  const url = `https://wa.me/${numeroCrackio}?text=${encodeURIComponent(mensaje)}`;

  // Limpieza y redirección
  vaciarCarrito();
  document.getElementById('panel-pedido')?.classList.remove('visible');
  setTimeout(() => {
    document.getElementById('panel-pedido')?.classList.add('oculto');
  }, 300);
  
  window.open(url, '_blank');
});


}



});


// Esta función necesita ser accesible globalmente para el botón onclick
window.eliminarProducto = function (id) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito(carrito);
  actualizarContadorCarrito();
  mostrarCarrito();
}
