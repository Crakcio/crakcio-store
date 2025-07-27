// pedido.js
import { actualizarContadorCarrito, mostrarCarrito } from './carrito.js';
import { supabase } from './supabaseClient.js';

export async function finalizarCompra() {
  try {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
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

    const productos = carrito.map(item => ({
      idProducto: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    }));

    const total = productos.reduce((sum, p) => sum + (p.precio * (p.cantidad || 1)), 0);

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
}
