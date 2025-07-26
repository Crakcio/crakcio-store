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

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}
const modal = document.getElementById("modal");
const botonCarrito = document.getElementById("boton-carrito");

if (botonCarrito) {
  botonCarrito.addEventListener("click", () => {
    modal.classList.remove("oculto");
    renderizarCarrito(); // ✅ Ya tienes esta función para actualizar el contenido
  });
}

const cerrarModal = document.getElementById("cerrarModal");
if (cerrarModal) {
  cerrarModal.addEventListener("click", () => {
    modal.classList.add("oculto");
  });
}

function renderizarCarrito() {
  const contenedor = document.getElementById('carritoContainer');
  if (!contenedor) return; // Evita error si no existe
  contenedor.innerHTML = '';

  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const total = calcularTotalCarrito(carrito);

  carrito.forEach((item, index) => {
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
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  const index = carrito.findIndex(item => item.id === producto.id);
  if (index !== -1) {
    mostrarMensaje("Este producto ya está en el carrito.", "warning");
    return;
  }

  const imagen = obtenerUrlImagen(producto.imagen_url);

  carrito.push({
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    imagen,
    cantidad: 1
  });

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito(carrito.length);
  mostrarMensaje("Producto agregado al carrito", "success");
}


window.eliminarDelCarrito = function(index) {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito(); // ✅ actualizar después de eliminar
  renderizarCarrito();
};


function calcularTotalCarrito(carrito) {
  return carrito.reduce((total, producto) => {
    return total + (producto.precio * (producto.cantidad || 1));
  }, 0);
}

// ------------------------- FINALIZAR COMPRA -----------------------------

const finalizarBtn = document.getElementById('finalizarCompra');

if (finalizarBtn) {
  finalizarBtn.addEventListener('click', async () => {
    // Verificar sesión iniciada
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Debes iniciar sesión para finalizar la compra.');
      return;
    }

    // Obtener carrito actualizado
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    // Crear mensaje para WhatsApp
    let mensaje = '🛒 *Nueva orden desde Crackio Store*\n\n';
    let total = 0;
    carrito.forEach(item => {
      mensaje += `🔹 ${item.nombre} x${item.cantidad} - S/ ${item.precio}\n`;
      total += item.precio * item.cantidad;
    });
    mensaje += `\n💰 Total: S/ ${total.toFixed(2)}\n`;
    mensaje += `📧 Cliente: ${user.email}`;

    // Abrir WhatsApp
    const numero = '51999207025'; // Número del vendedor con código de país
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

    // Limpiar carrito después de enviar
    localStorage.removeItem('carrito');
    actualizarContadorCarrito(0);
    renderizarCarrito();
  });
}

