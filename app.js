// app.js
console.log("✅ app.js se está cargando");
import { supabase } from './supabaseClient.js';

// ------------------------- AUTENTICACIÓN -----------------------------
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
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

// ------------------------- CARRITO DE COMPRAS -----------------------------

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


function mostrarMensaje(texto, tipo = "info") {
  const alerta = document.createElement("div");
  alerta.className = `mensaje ${tipo}`;
  alerta.textContent = texto;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
renderizarCarrito();
  configurarBotones();
  procesarPedidoAutomaticamenteSiExiste();
  const finalizarBtn = document.getElementById('finalizarCompra');

  if (finalizarBtn) {
  finalizarBtn.addEventListener('click', async () => {
   carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    console.log("Click en Finalizar compra");

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("Resultado de getSession():", session);
    console.log("¿Hay error?", sessionError);

    if (!session || !session.user) {
      alert('Debes iniciar sesión para finalizar la compra.');
      window.location.href = 'login.html';
      return;
    }

    const user = session.user;

    if (carrito.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    const productos = carrito.map(item => ({
      idProducto: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    }));

    const total = productos.reduce((sum, p) => sum + (p.precio * (p.cantidad || 1)), 0);

    const { error: pedidoError } = await supabase.from('pedidos').insert([{
      usuario_id: user.id,
      productos: productos,
      total: total,
      fecha: new Date().toISOString()
    }]);

    if (pedidoError) {
      alert('Error al registrar pedido: ' + pedidoError.message);
      return;
    }

    // WhatsApp
    let mensaje = `🛒 *Nuevo Pedido desde Crackio Store*%0A`;
    mensaje += `👤 Cliente: ${user.email}%0A`;
    mensaje += `📦 Productos:%0A`;

    productos.forEach(p => {
      mensaje += `- ${p.nombre} x${p.cantidad} - S/ ${p.precio * p.cantidad}%0A`;
    });

    mensaje += `💰 Total: S/ ${total.toFixed(2)}%0A`;
    mensaje += `📅 Fecha: ${new Date().toLocaleDateString()}`;

    const numeroTienda = '519999207025'; // ← reemplaza por el tuyo
    const url = `https://wa.me/${numeroTienda}?text=${mensaje}`;

    // Limpiar carrito
    localStorage.removeItem('carrito');
    actualizarContadorCarrito();
    renderizarCarrito();

    window.location.href = url;
  });
}

  document.getElementById("abrirCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.remove("oculto");
    renderizarCarrito();
  });

  document.getElementById("cerrarCarrito")?.addEventListener("click", () => {
  document.getElementById("modalCarrito")?.classList.add("oculto");
  });

  procesarPedidoAutomaticamenteSiExiste();
});

  document.getElementById("abrirCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.remove("oculto");
    renderizarCarrito();
  });

  document.getElementById("cerrarCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito")?.classList.add("oculto");

  });

  // Llamar función que revisa si el usuario está logueado y tiene productos para procesar compra automáticamente
 
});

async function procesarPedidoAutomaticamenteSiExiste() {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  if (carrito.length === 0) return;
    document.getElementById('modalCarrito')?.classList.remove('oculto');
  renderizarCarrito();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session || !session.user) return;

  const userId = session.user.id;

  const productos = carrito.map(item => ({
    idProducto: item.id,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precio: item.precio
  }));

  const total = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  const { error: pedidoError } = await supabase.from('pedidos').insert([{
    usuario_id: userId,
    productos: productos,
    total: total,
    fecha: new Date().toISOString()
  }]);

  if (pedidoError) {
    alert('Error al registrar pedido: ' + pedidoError.message);
    return;
  }

  carrito = [];
  localStorage.removeItem('carrito');
  actualizarContadorCarrito();
  renderizarCarrito();
  alert('Compra realizada con éxito. Gracias por tu pedido.');
}


// ------------------------- FINALIZAR COMPRA -----------------------------


 


 



