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
    <button class="btn-restar" data-id="${producto.id}">➖</button>
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
  document.getElementById("panel-contenido").innerHTML = "<p>Tu carrito está vacío.</p>";

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
  const contenidoCarrito = document.getElementById('panel-contenido');

  if (!contenidoCarrito) return;

  if (carrito.length === 0) {
    contenidoCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  let html = '<div class="lista-carrito">';
  carrito.forEach(item => {
    html += `
      <div class="item-carrito">
        <span>${item.nombre} - S/ ${item.precio} x ${item.cantidad}</span>
        <div>
          <button class="btn-restar" data-id="${item.id}">➖</button>
          <button class="btn-eliminar" data-id="${item.id}">❌</button>
        </div>
      </div>
    `;
  });
  html += '</div>';

  contenidoCarrito.innerHTML = html;

  // Asignar eventos a botones
  contenidoCarrito.querySelectorAll(".btn-restar").forEach(btn => {
    btn.addEventListener("click", () => {
      restarProductoDelCarrito(btn.dataset.id);
      mostrarResumenCarrito();
    });
  });

  contenidoCarrito.querySelectorAll(".btn-eliminar").forEach(btn => {
  btn.addEventListener("click", () => {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(p => p.id != btn.dataset.id);
    guardarCarrito(carrito);
    actualizarContadorCarrito();
    mostrarResumenCarrito();
    mostrarCarrito();
  });
});

}

});

export function restarProductoDelCarrito(id) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const index = carrito.findIndex(p => p.id == id);

  if (index !== -1) {
    carrito[index].cantidad -= 1;

    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarCarrito();
  }
}
document.addEventListener("click", e => {
  if (e.target.classList.contains("btn-restar")) {
    const id = e.target.getAttribute("data-id");
    restarProductoDelCarrito(id);
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
