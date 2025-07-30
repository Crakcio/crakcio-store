// pedido.js
import { actualizarContadorCarrito, mostrarCarrito } from './carrito.js';
import { supabase } from './supabaseClient.js';
// 🔒 Bandera global
let pedidoYaProcesado = false;
export async function finalizarCompra() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  if (pedidoYaProcesado) {
    console.warn("⛔ Ya se procesó este pedido. Ignorando clic duplicado.");
    return; // No continuar si ya se procesó
  }
   pedidoYaProcesado = true; // ✅ Marcar como procesado
  try {
    console.log("🧾 Procesando pedido...");
    
    console.log("Click en Finalizar compra");
    console.log("➡ Paso 1: obteniendo sesión");
    

      let user = null;
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();


    console.log("Resultado de getSession():", session);
    console.log("¿Hay error?", sessionError);


   if (sessionError || !session || !session.user) {
  console.error("⚠ No se pudo obtener la sesión del usuario:", sessionError);
  pedidoYaProcesado = false; // 👈 AÑADIR AQUÍ
  return;
}

    console.log("➡ Paso 3: obteniendo usuario");

if (session?.user) {
  user = session.user;
} else {
  const { data: { user: currentUser }, error: userError, } = await supabase.auth.getUser();

  if (currentUser) {
    user = currentUser;
  } else {
    console.error("No hay usuario activo:", error || userError);
    alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
    pedidoYaProcesado = false; // 👈 AÑADIR AQUÍ
    return;
  }
}
await new Promise(resolve => setTimeout(resolve, 500)); // Espera 500ms antes de continuar

console.log("✅ Usuario autenticado:", user.id);



console.log("➡ Paso 4: validando carrito");
if (carrito.length === 0) {
  alert('Tu carrito está vacío.');
  pedidoYaProcesado = false; // 👈 AÑADIR AQUÍ
  return;
}


  // 🔍 Buscar nombre desde tabla usuarios
  



    const { data: usuarioData, error: usuarioError } = await supabase
  .from('usuarios')
  .select('nombre')
  .eq('id', user.id)
  .single();

if (usuarioError || !usuarioData) {
  alert("No se pudo obtener tu nombre. Intenta nuevamente.");
  pedidoYaProcesado = false; // 👈 AÑADIR AQUÍ
  return;
}

const nombreCliente = usuarioData.nombre;



// Obtener datos del formulario
    const telefono = document.getElementById("telefono")?.value.trim() || "";
    const direccion = document.getElementById("direccion")?.value.trim() || "";
    const notas = document.getElementById("notas")?.value.trim() || "";
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked')?.value || "";
    const email = user?.email || "";
    console.log("Telefono:", telefono);
    console.log("Direccion:", direccion);
    console.log("Metodo de pago:", metodoPago);
    console.log("Email:", email);
    if (!telefono || !direccion || !metodoPago || !email) {
  Swal.fire({
    icon: "warning",
    title: "Campos incompletos",
    text: "Por favor completa todos los campos requeridos antes de confirmar el pedido.",
  });
  pedidoYaProcesado = false;
  return;
}
    // Formatear productos para guardar
   const productos = carrito.map(item => ({
  id: item.id,
  nombre: item.nombre,
  cantidad: item.cantidad,
  precio: item.precio
}));

    const total = productos.reduce((sum, p) => sum + (p.precio * (p.cantidad || 1)), 0);


console.log("📦 Insertando pedido con usuario_id:", user?.id);
console.log("📤 Enviando pedido a Supabase...");




// ✅ Verificar UID antes del insert
console.log("user.id:", user.id);
const { data: userData, error: userError } = await supabase.auth.getUser();
console.log("auth.uid():", userData?.user?.id);

if (userError) {
  console.error("❌ Error obteniendo user con getUser():", userError.message);
}



 
// Aquí va el log 👇
console.clear();
console.log("🧾 Enviando a Supabase el siguiente pedido:");
console.log({
  usuario_id: user.id,
  email: user.email,
  productos: productos,
  total: total,
  estado: "pendiente",
  nombre_cliente: nombreCliente,
  telefono: telefono,
  direccion: direccion,
  metodo_pago: metodoPago,
  notas: notas,
  fecha: new Date().toISOString()
});
console.table(productos);
// Guardar pedido en Supabase
// Crear objeto del pedido
const pedido = {
  usuario_id: user.id,
  email: user.email,
  productos,
  total,
  estado: "pendiente",
  nombre_cliente: nombreCliente,
  telefono,
  direccion,
  metodo_pago: metodoPago,
  notas,
  fecha: new Date().toISOString()
};

// Guardar pedido en Supabase
const { data, error: errorPedido } = await supabase.from("pedidos").insert([pedido]);

if (errorPedido) {
  console.error("❌ Error inesperado al insertar pedido:", errorPedido.message);
  Swal.fire("Error", "No se pudo registrar el pedido. Intenta nuevamente.", "error");
  pedidoYaProcesado = false;
  return;
}

if (data && data.length > 0) {
  console.log("✅ Pedido registrado exitosamente:", data[0]);
} else {
  console.warn("⚠ Pedido registrado, pero sin respuesta de datos.");
}

// Mostrar alerta y redirigir a WhatsApp
Swal.fire({
  title: "✅ ¡Pedido realizado!",
  text: "Tu pedido ha sido registrado exitosamente. Te contactaremos pronto.",
  icon: "success",
  confirmButtonText: "Aceptar",
  timer: 5000,
  timerProgressBar: true,
});

localStorage.removeItem("carrito");
actualizarContadorCarrito();
mostrarCarrito();

// Redirigir a WhatsApp
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

setTimeout(() => {
  window.location.href = url;
}, 2000);



if (errorPedido) {
  Swal.fire("Error", "Ocurrió un error inesperado", "error");
  pedidoYaProcesado = false; // 👈 AÑADIR AQUÍ
  return;
}
  } catch (error) {
  console.error("Error inesperado:", error);
  Swal.fire("Error", "Ocurrió un error inesperado", "error");
  pedidoYaProcesado = false; // 👈 AÑADIR AQUÍ
}
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".btn-pago").forEach(boton => {
    boton.addEventListener("click", () => {
      // Desmarcar todos
      document.querySelectorAll('input[name="metodo-pago"]').forEach(input => input.checked = false);
      // Activar el correspondiente
      const metodo = boton.getAttribute("data-metodo");
      const input = document.querySelector(`input[name="metodo-pago"][value="${metodo}"]`);
      if (input) input.checked = true;

      // Estilo visual
      document.querySelectorAll(".btn-pago").forEach(btn => btn.classList.remove("seleccionado"));
      boton.classList.add("seleccionado");
    });
  });
});

