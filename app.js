//app.js
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

let productos = [];
let pedidoYaProcesado = false;

// ------------------------- AUTENTICACIÓN -----------------------------

document.addEventListener('DOMContentLoaded', async () => {
  try {
    productos = await obtenerProductos();
    actualizarContadorCarrito();
    mostrarCarrito();
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }


  // 🔍 Buscador de productos
  const inputBusqueda = document.getElementById("inputBusqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", () => {
      const texto = inputBusqueda.value.toLowerCase().trim();
      const lista = document.getElementById("listaProductos");
      if (!texto) return (lista.innerHTML = "");
      const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        (p.categoria && p.categoria.toLowerCase().includes(texto))
      );
      mostrarProductos(productosFiltrados, "listaProductos");
    });
  }



  //////////////////icono de subcategorias////////////////////////////
    // Subcategorías toggle
  const productosToggle = document.getElementById('productosToggle');
  const submenu = document.getElementById('subcategorias');
  if (productosToggle && submenu) {
    productosToggle.addEventListener('click', () => {
      submenu.classList.toggle('visible');
      submenu.classList.toggle('oculto');
      const icono = document.getElementById('toggleIcon');
      if (icono) icono.textContent = submenu.classList.contains('visible') ? '▾' : '▸';
    });
  }


 
// Mostrar sidebar al acercar el mouse al borde izquierdo
  // Sidebar hover
  document.addEventListener('mousemove', e => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (e.clientX < 30) {
      sidebar.classList.add('visible');
    } else if (!sidebar.matches(':hover')) {
      sidebar.classList.remove('visible');
    }
  });

  // Menú perfil
  const perfilIcono = document.getElementById("perfilIcono");
  const perfilMenu = document.getElementById("perfilMenu");
  if (perfilIcono && perfilMenu) {
    perfilIcono.addEventListener("click", e => {
      e.stopPropagation();
      perfilMenu.classList.toggle("visible");
    });
    document.addEventListener("click", e => {
      if (!perfilIcono.contains(e.target) && !perfilMenu.contains(e.target)) {
        perfilMenu.classList.remove("visible");
      }
    });
  }
  verificarSesion();
  mostrarCarrito();
  procesarPedidoAutomaticamenteSiExiste(); 

// 🔘 BOTÓN FINALIZAR COMPRA
  const finalizarBtn = document.getElementById('finalizarCompra');
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', async () => {
      const carrito = obtenerCarrito();
      if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        alert("⚠️ Inicia sesión para continuar.");
        return;
      }


      // Escuchar confirmación del pedido (solo una vez)
      const confirmarBtn = document.getElementById("btnConfirmarPedido");
      confirmarBtn?.addEventListener("click", finalizarCompra, { once: true });
    });
  }
   // Abrir/Cerrar carrito
  document.getElementById("abrirCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.remove("oculto");
    mostrarCarrito();
  });

  document.getElementById("cerrarCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito")?.classList.add("oculto");
  });

  // Mostrar bienvenida solo una vez
  if (!sessionStorage.getItem("bienvenidaMostrada")) {
    Swal.fire({
      title: "🎁 ¡Bienvenido a Crackio Store!",
      text: "Los primeros 5 clientes tendrán un descuento especial. ¡Aprovecha nuestras ofertas de lanzamiento!",
      icon: "info",
      confirmButtonText: "¡Entendido!",
      timer: 7000,
      timerProgressBar: true,
      showCloseButton: true,
    });
    sessionStorage.setItem("bienvenidaMostrada", "true");
  }
});

function verificarSesion() {
  supabase.auth.getUser().then(({ data: { user } }) => {
    const loginBtn = document.getElementById('abrirLoginModal');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (user) {
      loginBtn?.classList.add('hidden');
      if (btnCerrarSesion) btnCerrarSesion.style.display = "inline-block";
    } else {
      loginBtn?.classList.remove('hidden');
      if (btnCerrarSesion) btnCerrarSesion.style.display = "none";
    }
  });
}

document.getElementById('btnCerrarSesion')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('carrito');
  alert('Sesión cerrada');
  location.reload();
});

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert('Error al registrar: ' + error.message);
      return;
    }

    if (!data.user?.confirmed_at) {
      alert('Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
      registerForm.reset();
    } else {
      const { session, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        alert('Cuenta creada pero no se pudo iniciar sesión: ' + loginError.message);
      } else {
        alert('Registro e inicio de sesión exitoso.');
        document.getElementById('registerModal').classList.add('hidden');
        verificarSesion();
      }
    }
  });
}

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

// Automatiza pedido si ya hay productos y usuario logueado
async function procesarPedidoAutomaticamenteSiExiste() {
  const carrito = obtenerCarrito();
  if (!carrito.length) return;

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) return;

  const userId = session.user.id;
  const total = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  const productos = carrito.map(p => ({
    id: p.id,
    nombre: p.nombre,
    cantidad: p.cantidad,
    precio: p.precio
  }));

  const pedido = {
    usuario_id: userId,
    productos,
    total,
    fecha: new Date().toISOString()
  };

  const { error: pedidoError } = await supabase
    .from("pedidos")
    .insert([pedido]);

  if (pedidoError) {
    console.error("🧨 Error insertando pedido:", pedidoError);
    alert("Error al registrar pedido: " + pedidoError.message);
    return;
  }

  localStorage.removeItem('carrito');
  actualizarContadorCarrito();
  mostrarCarrito();
  alert('Compra realizada con éxito. Gracias por tu pedido.');
}

