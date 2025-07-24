import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { cargarProductos } from './products.js';
import { actualizarCarrito, enviarPedidoWhatsApp, validarFormulario } from './ui.js';
import { obtenerProductos } from './products.js';
import { mostrarProductos } from './ui.js';

document.addEventListener("DOMContentLoaded", async () => {
  const productos = await obtenerProductos();
  mostrarProductos(productos, "contenedor-productos");

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


const SUPABASE_URL = 'https://twznikjjvtoedfaxbuvf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3em5pa2pqdnRvZWRmYXhidXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTI1NDAsImV4cCI6MjA2ODg2ODU0MH0.aOQ10hq-syYqrenvFxveBQj6wKqdDtsDKfykSm42MFE'; // ⚠️ Usa tu clave pública (anon)

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
