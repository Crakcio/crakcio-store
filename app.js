// app.js
console.log("✅ app.js se está cargando");
import {
  mostrarProductos,
  mostrarMensaje
} from "./ui.js";
import {
  agregarAlCarrito,
  actualizarContadorCarrito,
  mostrarCarrito,
} from './carrito.js';

import { finalizarCompra } from './pedido.js';
import { supabase } from './supabaseClient.js';
import { obtenerProductos } from './products.js';

// ------------------------- AUTENTICACIÓN -----------------------------

document.addEventListener('DOMContentLoaded', async () => {
  productos = await obtenerProductosDesdeSupabase(); // o local si es el caso
  mostrarProductos(productos);
  actualizarContadorCarrito();
  mostrarCarrito();
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
   console.log("finalizarBtn:", finalizarBtn);
  if (finalizarBtn) {
    console.log("Se encontró el botón Finalizar Compra ✅");
  finalizarBtn.addEventListener('click', async () => {
  try {
    
    console.log("Click en Finalizar compra");

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

    const total = productos.reduce((sum, p) => sum + (p.precio * (p.cantidad || 1)), 0);
      const fechaPedido = new Date().toISOString();
const pedido = {
  usuario_id: user.id,
  productos,
  total,
  fecha: fechaPedido
};


    const { error: pedidoError } = await supabase.from('pedidos').insert([{
      usuario_id: user.id,
      productos: productos,
      total: total,
      fecha: new Date().toISOString()
    }]);

    if (pedidoError) {
      console.error('❌ Error al registrar pedido:', pedidoError);
      alert('Error al registrar pedido: ' + pedidoError.message);
      return;
    }

    alert("¡Compra realizada con éxito!");
    localStorage.removeItem("carrito");
    actualizarContadorCarrito();
    mostrarCarrito();

    // WhatsApp
    let mensaje = `🛒 *Nuevo Pedido desde Crackio Store*%0A`;
    mensaje += `👤 Cliente: ${user.email}%0A`;
    mensaje += `📦 Productos:%0A`;

    productos.forEach(p => {
      mensaje += `- ${p.nombre} x${p.cantidad} - S/ ${p.precio * p.cantidad}%0A`;
    });

    mensaje += `💰 Total: S/ ${total.toFixed(2)}%0A`;
    mensaje += `📅 Fecha: ${new Date().toLocaleDateString()}`;

    const numeroTienda = '519999207025';
    const url = `https://wa.me/${numeroTienda}?text=${mensaje}`;

    window.location.href = url;

  } catch (err) {
    console.error("🧨 Error en finalizarCompra:", err);
    alert("Ocurrió un error al finalizar la compra. Revisa la consola.");
  }


  });
   
}

  document.getElementById("abrirCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.remove("oculto");
    mostrarCarrito();
  });

  document.getElementById("cerrarCarrito")?.addEventListener("click", () => {
  document.getElementById("modalCarrito")?.classList.add("oculto");
  });

});


  // Llamar función que revisa si el usuario está logueado y tiene productos para procesar compra automáticamente

async function procesarPedidoAutomaticamenteSiExiste() {
  
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
  usuario_id: session.user.id,
  productos,
  total,
  fecha: fechaPedido
};


  const { error: pedidoError } = await supabase.from('pedidos').insert([pedido]);


  if (pedidoError) {
    alert('Error al registrar pedido: ' + pedidoError.message);
    return;
  }

  carrito = [];
  localStorage.removeItem('carrito');
  actualizarContadorCarrito();
  mostrarCarrito();
  alert('Compra realizada con éxito. Gracias por tu pedido.');
}
window.agregarAlCarrito = agregarAlCarrito;


// ------------------------- FINALIZAR COMPRA -----------------------------

 



