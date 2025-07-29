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
  guardarCarrito
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
  //////////////////icono de subcategorias////////////////////////////
    const productosToggle = document.getElementById('productosToggle');
    const submenu = document.getElementById('subcategorias');
    const icon = document.getElementById('toggleIcon');

    if (productosToggle && submenu && icon) {
    productosToggle.addEventListener('click', () => {
    submenu.classList.toggle('visible');
    submenu.classList.toggle('oculto');

    const isOpen = submenu.classList.contains('visible');
    icon.textContent = isOpen ? '▾' : '▸';
  });
}

 
// Mostrar sidebar al acercar el mouse al borde izquierdo
  document.addEventListener('mousemove', e => {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  if (e.clientX < 30) {
    sidebar.classList.add('visible');
  } else if (!sidebar.matches(':hover')) {
    sidebar.classList.remove('visible');
  }
  });

 
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
    // Cierra el modal del carrito (si está abierto)
  const modalCarrito = document.getElementById('modal');
  modalCarrito.classList.remove('activo');
  modalCarrito.classList.add('oculto');

// Abre el modal de método de pago
  const modalPago = document.getElementById('modal-pago');
  modalPago.classList.remove('hidden');

    // Mostrar el modal de métodos de pago
    document.getElementById("modalCarrito")?.classList.add("oculto"); // 👈 Oculta el modal del carrito
  document.getElementById("modal-pago")?.classList.remove("hidden"); // 👈 Muestra el modal de pago

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
try {
  const numeroTienda = "519999207025";
  const fecha = new Date().toLocaleDateString();

  const metodoPago = "Yape"; // ← Asegúrate de tener esto definido

  let mensaje = `🛒 *Nuevo pedido* (${metodoPago})
👤 Cliente: ${session.user.email}
📦 Productos:`;

  productos.forEach(p => {
    mensaje += `\n- ${p.nombre} x${p.cantidad} - S/ ${(p.precio * p.cantidad).toFixed(2)}`;
  });

  mensaje += `\n💰 Total: S/ ${total.toFixed(2)}`;
  mensaje += `\n📅 Fecha: ${fecha}`;

  const url = `https://wa.me/${numeroTienda}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
} catch (e) {
  console.error("Error al generar mensaje de WhatsApp:", e);
}




  document.getElementById("abrirCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.remove("oculto");
    mostrarCarrito();
  });

  document.getElementById("cerrarCarrito")?.addEventListener("click", () => {
  document.getElementById("modalCarrito")?.classList.add("oculto");
  });
}

  // Llamar función que revisa si el usuario está logueado y tiene productos para procesar compra automáticamente



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
console.log("Archivo cargado completamente");
