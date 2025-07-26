import { obtenerDeLocalStorage, guardarEnLocalStorage } from "./helpers.js";
import { mostrarCarrito, actualizarContadorCarrito, mostrarPopupCarrito } from "./ui.js";
import { cargarProductos } from "./products.js"; // reutilizado

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ appCliente.js se está cargando");

  cargarProductos(); // Reutiliza función para mostrar productos

  const abrirBtn = document.getElementById("boton-carrito");
  const popup = document.getElementById("popup-carrito");
  const finalizarBtn = document.getElementById("finalizarCompra");

  if (abrirBtn && popup) {
    abrirBtn.addEventListener("click", () => {
      mostrarCarrito();
      popup.classList.add("mostrar");

      // Cerrar automáticamente en 3 segundos
      setTimeout(() => {
        popup.classList.remove("mostrar");
      }, 3000);
    });
  }

  if (finalizarBtn) {
    finalizarBtn.addEventListener("click", () => {
      guardarEnLocalStorage("carrito", []);
      mostrarCarrito();
      actualizarContadorCarrito();
      alert("Compra finalizada correctamente 🎉");
    });
  }

  actualizarContadorCarrito();
});
