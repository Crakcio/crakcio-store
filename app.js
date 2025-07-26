// app.js

import { supabase } from './supabaseClient.js';

// ------------------------- AUTENTICACIÓN -----------------------------
document.addEventListener("DOMContentLoaded", () => {
   

// Registro de usuario
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert('Error al registrar: ' + error.message);
    } else {
      alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
      registerForm.reset();
    }
  });
}

// Inicio de sesión
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { session, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } else {
      alert('Bienvenido/a');
      document.getElementById('loginModal').classList.add('hidden');
      verificarSesion();
    }
  });
}

// Cerrar sesión (unificado)
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener('click', async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('carrito');
    alert('Sesión cerrada');
    location.reload();
  });
}

// Verifica si hay usuario logueado y muestra/oculta botones
function verificarSesion() {
  supabase.auth.getUser().then(({ data: { user } }) => {
   const loginBtn = document.getElementById('abrirLoginModal');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');

    if (user) {
      if (loginBtn) loginBtn.classList.add('hidden');
      if (btnCerrarSesion) btnCerrarSesion.style.display = "inline-block";
} else {
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (btnCerrarSesion) btnCerrarSesion.style.display = "none";
}

  });
}

verificarSesion();



// ------------------------- CARRITO DE COMPRAS -----------------------------

// app.js optimizado con mejoras sugeridas

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para obtener URL pública desde Supabase
function obtenerUrlImagen(path) {
  const { data } = supabase.storage.from('imgproductos').getPublicUrl(path);
  return data.publicUrl || 'images/placeholder.webp';
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function renderizarCarrito() {
  const contenedor = document.getElementById("carritoItems");
  contenedor.innerHTML = "";

  carrito.forEach((producto, index) => {
    const item = document.createElement("div");
    item.classList.add("carrito-item");

    item.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" class="carrito-img" />
      <div class="carrito-detalle">
        <h4>${producto.nombre}</h4>
        <p>S/ ${producto.precio}</p>
      </div>
      <button onclick="eliminarDelCarrito(${index})">X</button>
    `;

    contenedor.appendChild(item);
  });

  document.getElementById("totalCarrito").textContent =
    "Total: S/ " + calcularTotalCarrito();
}

function calcularTotalCarrito() {
  return carrito.reduce((total, producto) => {
    return total + (producto.precio * (producto.cantidad || 1));
  }, 0);
}

window.eliminarDelCarrito = function(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  renderizarCarrito();
};



  const imagen = producto.imagen || obtenerUrlImagen(producto.imagen_url);

  carrito.push({
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen,
    cantidad: 1
  });

  guardarCarrito();
  renderizarCarrito();
  mostrarMensaje("Producto agregado al carrito", "success");
}

function mostrarMensaje(texto, tipo = "info") {
  const alerta = document.createElement("div");
  alerta.className = `mensaje ${tipo}`;
  alerta.textContent = texto;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 2500);
}

document.addEventListener("DOMContentLoaded", () => {
  carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  document.getElementById("abrirCarrito").addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.remove("oculto");
    renderizarCarrito();
  });

  document.getElementById("cerrarCarrito").addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.add("oculto");
  });

  document.getElementById("finalizarCompra").addEventListener("click", () => {
    if (carrito.length === 0) return mostrarMensaje("Carrito vacío", "warning");

    const mensaje = carrito.map(p => `- ${p.nombre} (S/ ${p.precio})`).join("%0A");
    const total = calcularTotalCarrito();
    const numero = "51999999999"; // reemplaza con tu número

    const url = `https://wa.me/${numero}?text=Hola,%20quiero%20comprar:%0A${mensaje}%0A%0ATotal:%20S/%20${total}`;
    window.open(url, "_blank");

    carrito = [];
    guardarCarrito();
    renderizarCarrito();
    document.getElementById("modalCarrito").classList.add("oculto");
  });

  actualizarContadorCarrito();
  renderizarCarrito();
});


// ------------------------- FINALIZAR COMPRA -----------------------------

const finalizarBtn = document.getElementById('finalizarCompra');

if (finalizarBtn) {
  finalizarBtn.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debes iniciar sesión para finalizar la compra.');
      return;
    }

    if (carrito.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    let mensaje = '🛒 *Nueva orden desde Crackio Store*\n\n';
    let total = 0;
    carrito.forEach(item => {
      mensaje += `🔹 ${item.nombre} x${item.cantidad} - S/ ${item.precio}\n`;
      total += item.precio * item.cantidad;
    });
    mensaje += `\n💰 Total: S/ ${total.toFixed(2)}\n`;
    mensaje += `📧 Cliente: ${user.email}`;

    const numero = '51999207025';
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    carrito = [];
    guardarCarrito();
   actualizarContadorCarrito();
   renderizarCarrito();
  });
}



