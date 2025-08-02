// pedido.js
import { actualizarContadorCarrito, mostrarCarrito } from './carrito.js';
import { supabase } from './supabaseClient.js';
// 🔒 Bandera global
let pedidoYaProcesado = false;

export async function finalizarCompra() {
  if (pedidoYaProcesado) return;
  pedidoYaProcesado = true;

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (!carrito.length) {
    Swal.fire("Carrito vacío", "Agrega productos antes de continuar.", "warning");
    pedidoYaProcesado = false;
    return;
  }

  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    Swal.fire("No logueado", "Debes iniciar sesión para comprar.", "warning");
    pedidoYaProcesado = false;
    return;
  }

  const user = session.user;

  // Obtener nombre del cliente
  
  const { data: usuarioData, error: usuarioError } = await supabase
    .from("usuarios")
    .select("nombre")
    .eq("id", user.id)
    .single();

  const nombreCliente = usuarioData?.nombre || "Cliente";

  // Obtener campos del formulario
  const telefono = document.getElementById("telefono")?.value.trim();
  const direccion = document.getElementById("direccion")?.value.trim();
  const notas = document.getElementById("notas")?.value.trim() || "";
  const metodoPago = window.metodoSeleccionado || "";
  console.log("🧾 Método de pago seleccionado:", metodoPago);
  const email = user.email;

  if (!telefono || !direccion || !metodoPago) {
    Swal.fire("Campos requeridos", "Completa todos los campos antes de continuar.", "warning");
    pedidoYaProcesado = false;
    return;
  }

  const productos = carrito
    .filter(p => p.cantidad > 0)
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio: p.precio
    }));

  // Calculamos el total del carrito sumando precio * cantidad
  const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  // 💳 PAGO CON TARJETA (Culqi)
  if (window.metodoSeleccionado === "tarjeta") {
    Culqi.publicKey = "TU_LLAVE_PUBLICA"; // ⚠️ Reemplaza esto con tu llave pública real de Culqi

    Culqi.settings({
      title: "Crakcio Store",
      currency: "PEN", // Soles peruanos
      description: "Compra de productos",
      amount: total * 100, // Culqi trabaja en centavos
    });

    Culqi.open();

    // Esta función se llama automáticamente cuando el pago Culqi termina
    window.culqi = async function () {
      if (Culqi.token) {
        const token = Culqi.token.id;

        // Llamamos a Supabase Function para procesar el cobro
        const res = await fetch("https://TU-PROYECTO.functions.supabase.co/crear-cobro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            monto: total * 100,
            descripcion: "Pedido Crakcio Store",
            email, // ⚠️ asegúrate de tener disponible el correo del cliente
          }),
        });

        const result = await res.json();

        if (result.object === "charge" && result.outcome.type === "venta_exitosa") {
          // Si el pago fue exitoso, guardamos el pedido
          await guardarPedidoYDetalle(); // ⚠️ Asegúrate de tener esta función implementada
        } else {
          // Si el pago falló
          Swal.fire("Pago fallido", result.user_message || "Intenta con otra tarjeta", "error");
          pedidoYaProcesado = false;
        }
      } else {
        // Si hubo error con Culqi
        Swal.fire("Error", Culqi.error.user_message || "No se completó el pago", "error");
        pedidoYaProcesado = false;
      }
    };

 // 🔵 PAGO CON PLIN
} else if (window.metodoSeleccionado?.toLowerCase() === "plin") {
  await Swal.fire({
    title: "Pago con Plin",
    html: `
      <p>Escanea el código QR y escribe el número de operación en el formulario.</p>
      <img src='images/plin-qr.jpeg' alt='QR Plin' style='width:200px;'>
      <p>Después de pagar, presiona Enviar Comprobante para enviar tu comprobante por WhatsApp.</p>
    `,
    confirmButtonText: "Enviar comprobante",
  }).then(async (result) => {
    if (result.isConfirmed) {
      console.log("🧪 Confirmado (Plin): Ejecutando guardarPedidoYDetalle()...");

      try {
        await guardarPedidoYDetalle();
        pedidoYaProcesado = true;
        console.log("✅ Pedido y detalle guardados correctamente (Plin)");

        const resumen = carrito.map(p => `• ${p.nombre} x${p.cantidad}`).join("%0A");
        const totalTexto = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0).toFixed(2);
        const metodo = window.metodoSeleccionado;
        const fecha = new Date().toLocaleString();

        const mensaje = `Hola, soy un cliente de Crakcio Store 🛒.%0A` +
          `He pagado con *${metodo.toUpperCase()}* el siguiente pedido:%0A` +
          `${resumen}%0A` +
          `Total: S/ ${totalTexto}%0A` +
          `Fecha: ${fecha}%0A` +
          `Aquí está mi comprobante:`;

        const whatsappLink = `https://wa.me/51999207025?text=${mensaje}`;
        console.log("📲 Redirigiendo a WhatsApp...");
        window.open(whatsappLink, "_blank");

      } catch (error) {
        console.error("🧨 Error al guardar pedido (Plin):", error);
        Swal.fire("Error", "No se pudo completar el pedido", "error");
        pedidoYaProcesado = false;
      }
    }
  });

// 🟣 PAGO CON YAPE
} else if (window.metodoSeleccionado?.toLowerCase() === "yape") {
  await Swal.fire({
    title: "Pago con Yape",
    html: `
      <p>Escanea el código QR y escribe el número de operación en el formulario.</p>
      <img src='images/yape-qr.jpeg' alt='QR Yape' style='width:200px;'>
      <p>Después de pagar, presiona Enviar Comprobante para enviar tu comprobante por WhatsApp.</p>
    `,
    confirmButtonText: "Enviar comprobante",
  }).then(async (result) => {
    if (result.isConfirmed) {
      console.log("🧪 Confirmado (Yape): Ejecutando guardarPedidoYDetalle()...");

      try {
        await guardarPedidoYDetalle();
        pedidoYaProcesado = true;
        console.log("✅ Pedido y detalle guardados correctamente (Yape)");

        const resumen = carrito.map(p => `• ${p.nombre} x${p.cantidad}`).join("%0A");
        const totalTexto = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0).toFixed(2);
        const metodo = window.metodoSeleccionado;
        const fecha = new Date().toLocaleString();

        const mensaje = `Hola, soy un cliente de Crakcio Store 🛒.%0A` +
          `He pagado con *${metodo.toUpperCase()}* el siguiente pedido:%0A` +
          `${resumen}%0A` +
          `Total: S/ ${totalTexto}%0A` +
          `Fecha: ${fecha}%0A` +
          `Aquí está mi comprobante:`;

        const whatsappLink = `https://wa.me/51999207025?text=${mensaje}`;
        console.log("📲 Redirigiendo a WhatsApp...");
        window.open(whatsappLink, "_blank");

      } catch (error) {
        console.error("🧨 Error al guardar pedido (Yape):", error);
        Swal.fire("Error", "No se pudo completar el pedido", "error");
        pedidoYaProcesado = false;
      }
    }
  });

}else {
    Swal.fire("Error", "Método de pago no implementado o no seleccionado", "error");
    return;
  }

}
 
window.finalizarCompra = finalizarCompra;
async function guardarPedidoYDetalle() {
  console.log("🧪 Ejecutando guardarPedidoYDetalle...");

  try {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    console.log("🛒 Carrito obtenido:", carrito);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      console.error("❌ No hay sesión activa o error:", sessionError);
      return;
    }

    const user = session.user;
    const email = user.email;
    const productos = carrito.map(p => ({
  id: p.id,
  nombre: p.nombre,
  precio: p.precio,
  cantidad: p.cantidad ?? 1  // usamos ?? para asegurar valor por defecto
}));

    const total = productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

    // ⚠️ Obtener datos del formulario
    const nombreCliente = document.getElementById("nombreCliente")?.value || "Sin nombre";
    const telefono = document.getElementById("telefono")?.value || "Sin número";
    const direccion = document.getElementById("direccion")?.value || "Sin dirección";
    const notas = document.getElementById("notas")?.value || "";
    const metodo = window.metodoSeleccionado || "desconocido";

    console.log("📧 Email:", email);
    console.log("📞 Teléfono:", telefono);
    console.log("🏠 Dirección:", direccion);
    console.log("💬 Notas:", notas);
    console.log("🏷 Método de pago:", metodo);
    console.log("💳 Total:", total);

    const pedido = {
  usuario_id: user.id,
  email,
  total,
  estado: "pagado",
  nombre_cliente: nombreCliente,
  telefono,
  direccion,
  metodo_pago: metodo,
  notas,
  fecha: new Date().toISOString(),
};

console.log("👤 Supabase UID (auth.uid):", user.id);
console.log("📝 Pedido.usuario_id:", pedido.usuario_id);

    console.log("📤 Insertando pedido:", pedido);

    const { data, error } = await supabase
      .from("pedidos")
      .insert([pedido])
      .select();

    if (error || !data?.[0]) {
      console.error("❌ Error Supabase al guardar pedido:", error);
      Swal.fire("Error", "No se pudo guardar el pedido", "error");
      pedidoYaProcesado = false;
      return;
    }

    console.log("✅ Pedido guardado:", data[0]);

    const pedidoId = data[0].id;

    const detalle = carrito.map(p => ({
  nombre: p.nombre,
  cantidad: p.cantidad,
  precio_unitario: p.precio,
  productos_id: p.id,
  pedido_id: pedidoId,
}));
console.log("🔥 INSERTANDO detalle_pedido:", detalle);
console.log("🆔 pedidoId que se usará:", pedidoId);

const { data: detalleInsertado, error: errorDetalle } = await supabase
  .from("detalle_pedido")
  .insert(detalle);

if (errorDetalle) {
  console.error("❌ Error al guardar detalle:", errorDetalle.message);
} else {
  console.log("✅ Detalle insertado:", detalleInsertado);
}


    if (errorDetalle) {
  console.error("❌ Error al guardar detalle:", errorDetalle.message);
} else {
  console.log("✅ Detalle insertado:", detalleInsertado);
}

    // Mostrar alerta y limpiar carrito
    Swal.fire("✅ Pedido confirmado", "Tu compra fue exitosa", "success");
    localStorage.removeItem("carrito");
    actualizarContadorCarrito();
    mostrarCarrito();

    // Redirigir a WhatsApp
    let mensaje = `🛒 *Nuevo Pedido desde Crakcio Store*%0A`;
    mensaje += `👤 Cliente: ${email}%0A`;
    mensaje += `📞 Teléfono: ${telefono}%0A`;
    mensaje += `📦 Productos:%0A`;

    productos.forEach(p => {
      mensaje += `- ${p.nombre} x${p.cantidad} - S/ ${p.precio * p.cantidad}%0A`;
    });

    mensaje += `💰 Total: S/ ${total.toFixed(2)}%0A`;
    mensaje += `🗓 Fecha: ${new Date().toLocaleDateString()}`;

    const numeroTienda = "51999207025";
    const url = `https://wa.me/${numeroTienda}?text=${mensaje}`;
    console.log("📲 Redirección lista, pero pausada para ver errores");

Swal.fire({
  icon: "success",
  title: "Pedido guardado",
  text: "En 5 segundos serás redirigido a WhatsApp para enviar tu comprobante...",
  timer: 5000,
  timerProgressBar: true,
  showConfirmButton: false,
  willClose: () => {
    window.location.href = url;
  }
});

  } catch (error) {
    console.error("🧨 Error inesperado en guardarPedidoYDetalle:", error);
    Swal.fire("Error", "Hubo un error inesperado al guardar el pedido", "error");
  }
}

window.guardarPedidoYDetalle = guardarPedidoYDetalle;
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

