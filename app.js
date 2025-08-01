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

  document.addEventListener('mousemove', e => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (e.clientX < 30) {
      sidebar.classList.add('visible');
    } else if (!sidebar.matches(':hover')) {
      sidebar.classList.remove('visible');
    }
  });

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

    });
  }

  document.getElementById("abrirCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito").classList.remove("oculto");
    mostrarCarrito();
  });

  document.getElementById("cerrarCarrito")?.addEventListener("click", () => {
    document.getElementById("modalCarrito")?.classList.add("oculto");
  });

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

  const botonFinalizar = document.getElementById("ir-a-formulario");
  botonFinalizar?.addEventListener("click", () => {
    const form = document.getElementById("formulario-pedido");
    if (form) {
      form.classList.remove("oculto");
      inicializarBotonesPago();

    const confirmarBtn = document.getElementById("btnConfirmarPedido");
    if (confirmarBtn) {
      confirmarBtn.addEventListener("click", finalizarCompra, { once: true });
    }

    }
  });
});

function verificarSesion() {
  supabase.auth.getUser().then(({ data: { user } }) => {
    const loginBtn = document.getElementById('abrirLoginModal');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (user) {
      loginBtn?.classList.add('hidden');
      btnCerrarSesion.style.display = "inline-block";
    } else {
      loginBtn?.classList.remove('hidden');
      btnCerrarSesion.style.display = "none";
    }
  });
}

document.getElementById('btnCerrarSesion')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('carrito');
  alert('Sesión cerrada');
  location.reload();
});

function inicializarBotonesPago() {
  const botones = document.querySelectorAll(".btn-pago");

  if (botones.length === 0) {
    console.warn("⚠️ No se encontraron botones de método de pago.");
    return;
  }

  botones.forEach(button => {
    button.addEventListener("click", () => {
      botones.forEach(btn => btn.classList.remove("selected"));
      button.classList.add("selected");
      window.metodoSeleccionado = button.getAttribute("data-metodo");
      console.log("✅ Método seleccionado:", window.metodoSeleccionado);
    });
  });
}

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
