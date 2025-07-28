// app.js
console.log("✅ app.js se está cargando");
import {
  mostrarProductos,
  mostrarMensaje
} from "./ui.js";
import {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarContadorCarrito,
  mostrarCarrito,
} from './carrito.js';

import { finalizarCompra } from './pedido.js';
import { supabase } from './supabaseClient.js';
import { obtenerProductos } from './products.js';

// ------------------------- AUTENTICACIÓN -----------------------------
let productos = [];
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const productos = await obtenerProductos(); // ✅ obtener desde Supabase o local
    mostrarProductos(productos, "listaProductos"); // ✅ mostrar los productos
    actualizarContadorCarrito(); // ✅ actualizar contador del carrito
    mostrarCarrito(); // ✅ mostrar contenido del carrito si lo hay
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
});

 // Evento de añadir al carrito
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart")) {
    const id = parseInt(e.target.dataset.id);
    const producto = productos.find(p => p.id === id);
    if (producto) agregarAlCarrito(producto);
  }
});

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
  const user = data.user;
  
  // Si el usuario requiere confirmación por correo, no se logueará automáticamente
  if (!user.confirmed_at && user.confirmation_sent_at) {
    alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
    registerForm.reset();
    return;
  }

  // Si el usuario está confirmado, se inicia sesión automáticamente
  const { session, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) {
    alert('Cuenta creada pero no se pudo iniciar sesión: ' + loginError.message);
  } else {
    alert('Registro exitoso e inicio de sesión realizado.');
    document.getElementById('registerModal').classList.add('hidden');
    verificarSesion(); // actualiza botones
  }
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

  verificarSesion();
  mostrarCarrito();
   procesarPedidoAutomaticamenteSiExiste();
  
 const finalizarBtn = document.getElementById('finalizarCompra');
if (finalizarBtn) {
  finalizarBtn.addEventListener('click', async () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      alert("Debes iniciar sesión para finalizar la compra.");
      return;
    }

    // Mostrar el modal de métodos de pago
    document.getElementById("modal-pago")?.classList.remove("hidden");
  });
}

// Escuchar botones de método de pago
document.querySelectorAll("#modal-pago button").forEach(boton => {
  boton.addEventListener("click", async (e) => {
    const metodo = e.currentTarget.id.replace("pago-", ""); // yape, plin, tarjeta
    await registrarPedidoConMetodoPago(metodo);
  });
});

async function registrarPedidoConMetodoPago(metodoPago) {
  const carrito = obtenerCarrito();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.user) {
    alert("Sesión no válida. Intenta iniciar sesión.");
    return;
  }

  const userId = session.user.id;
  const productos = carrito.map(p => ({
    idProducto: p.id,
    nombre: p.nombre,
    cantidad: p.cantidad,
    precio: p.precio
  }));

  const total = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  const pedido = {
    usuario_id: userId,
    productos,
    total,
    metodo_pago: metodoPago,
    fecha: new Date().toISOString()
  };

  const { error: pedidoError } = await supabase.from('pedidos').insert([pedido]);
  if (pedidoError) {
    alert("Error al registrar pedido: " + pedidoError.message);
    return;
  }

  localStorage.removeItem("carrito");
  actualizarContadorCarrito();
  mostrarCarrito();

  document.getElementById("modal-pago")?.classList.add("hidden");

  alert("Pedido registrado con éxito por " + metodoPago);

  // Redirigir a WhatsApp (si quieres)
  const numero = "519999207025";
  const mensaje = encodeURIComponent(`
🛒 Nuevo pedido (${metodoPago})
Cliente: ${session.user.email}
Total: S/ ${total.toFixed(2)}
`);
  window.location.href = `https://wa.me/${numero}?text=${mensaje}`;
}





  document.getElementById("abrirCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.remove("oculto");
    mostrarCarrito();
  });

  document.getElementById("cerrarCarrito")?.addEventListener("click", () => {
  document.getElementById("modalCarrito")?.classList.add("oculto");
  });


  // Llamar función que revisa si el usuario está logueado y tiene productos para procesar compra automáticamente

import { guardarCarrito } from './carrito.js';


async function procesarPedidoAutomaticamenteSiExiste() {
  const carrito = obtenerCarrito(); // ✅ Usando el nombre correcto

  if (carrito.length === 0) return;

  document.getElementById('modalCarrito')?.classList.remove('oculto');
  mostrarCarrito();

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

  const fechaPedido = new Date().toISOString();
  const pedido = {
    usuario_id: userId,
    productos,
    total,
    fecha: fechaPedido
  };

  const { error: pedidoError } = await supabase.from('pedidos').insert([pedido]);

  if (pedidoError) {
    alert('Error al registrar pedido: ' + pedidoError.message);
    return;
  }

  localStorage.removeItem('carrito'); // Vaciar carrito manualmente
  actualizarContadorCarrito();
  mostrarCarrito();
  alert('Compra realizada con éxito. Gracias por tu pedido.');
}


// ------------------------- FINALIZAR COMPRA -----------------------------

 



