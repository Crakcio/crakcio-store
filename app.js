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

    const { user, error } = await supabase.auth.signUp({ email, password });
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

// Cerrar sesión
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
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
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
      if (loginBtn) loginBtn.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
    }
  });
}

verificarSesion();

// ------------------------- CARRITO DE COMPRAS -----------------------------

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function renderizarCarrito() {
  const contenedor = document.getElementById('carritoContainer');
  if (!contenedor) return; // Evita error si no existe
  contenedor.innerHTML = '';
  let total = 0;

  carrito.forEach((item, index) => {
    total += item.precio * item.cantidad;
    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <strong>${item.nombre}</strong><br>
        Precio: S/ ${item.precio} x ${item.cantidad}<br>
        <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
      </div>
      <hr>
    `;
    contenedor.appendChild(div);
  });

  const totalElem = document.getElementById('totalCarrito');
  if (totalElem) {
    totalElem.textContent = 'Total: S/ ' + total.toFixed(2);
  }
}


function agregarAlCarrito(producto) {
  const existente = carrito.find(p => p.id === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  guardarCarrito();
  renderizarCarrito();
  alert('Producto agregado al carrito.');
}

window.eliminarDelCarrito = function(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  renderizarCarrito();
};

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

    let mensaje = '🛒 *Nueva orden desde Crakcio Store*\n\n';
    let total = 0;
    carrito.forEach(item => {
      mensaje += `🔹 ${item.nombre} x${item.cantidad} - S/ ${item.precio}\n`;
      total += item.precio * item.cantidad;
    });
    mensaje += `\n💰 Total: S/ ${total.toFixed(2)}\n`;
    mensaje += `📧 Cliente: ${user.email}`;

    const numero = '51999207025'; // Tu número de WhatsApp con código de país
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  });
}

renderizarCarrito();
});
