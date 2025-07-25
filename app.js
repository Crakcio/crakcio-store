import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { supabase } from "./supabaseClient.js";
import { actualizarCarrito, enviarPedidoWhatsApp, validarFormulario } from './ui.js';
import { mostrarProductos } from './ui.js';
import { cargarProductos } from './products.js';
cargarProductos().then(productos => {
  mostrarProductos(productos, 'contenedor-productos'); // <--- ID correcto aquí
});
document.addEventListener("DOMContentLoaded", cargarProductos);
document.addEventListener("DOMContentLoaded", async () => {
  const productos = await cargarProductos();
  mostrarProductos(productos, "contenedor-productos");
console.log("Productos recibidos:", productos);

  // Activar botones de categoría
  const botones = document.querySelectorAll(".btn-categoria");
  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const categoria = boton.dataset.categoria;
      mostrarProductos(productos, "contenedor-productos", categoria);
    });
  });

  // Login (como ya lo tienes)
  document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (email && password) {
      alert(`¡Bienvenido, ${email.split('@')[0]}!`);
    } else {
      alert("Por favor ingresa tus datos.");
    }
  });
});


// Eventos
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarCarrito();

  const boton = document.getElementById("btn-enviar-pedido");
  if (boton) {
    boton.addEventListener("click", () => {
      if (validarFormulario()) enviarPedidoWhatsApp();
    });
  }
});
export { cargarProductos };
