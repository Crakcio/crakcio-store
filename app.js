import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { cargarProductos } from './products.js';
import { actualizarCarrito, enviarPedidoWhatsApp, validarFormulario } from './ui.js';

const SUPABASE_URL = 'https://twznikjjvtoedfaxbuvf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOi...'; // ⚠️ Usa tu clave pública (anon)

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
