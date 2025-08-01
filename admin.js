import { supabase } from './supabaseClient.js';

const form = document.getElementById('agregarProductoForm');
const cerrarSesionAdmin = document.getElementById('cerrarSesionAdmin');
const formEditar = document.getElementById('formEditarProducto');
const cancelarEditar = document.getElementById('cancelarEditar');

// Cerrar sesión
cerrarSesionAdmin.addEventListener('click', async () => {
  console.log("Cerrando sesión...");
  await supabase.auth.signOut();
  window.location.href = "index.html";
});

// Verificación de rol antes de cargar cualquier dato
async function verificarAdmin() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session || !session.user) {
    console.log("No hay sesión activa");
    window.location.href = "login.html";
    return;
  }

  const userId = session.user.id;

  const { data: perfil, error: perfilError } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", userId)
    .single();

  if (perfilError || !perfil || perfil.rol !== "admin") {
    console.log("Acceso denegado: No eres admin.");
    window.location.href = "login.html";
    return;
  }

  console.log("Bienvenido admin");
  cargarProductos(); // Solo se llama si es admin
  cargarPedidos();
}

async function subirImagenASupabase(file, nombreArchivo) {
  const { data, error } = await supabase.storage
    .from('imgproductos')
    .upload(nombreArchivo, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error al subir imagen:', error.message);
    return null;
  }

  // Retornar la ruta pública
   const { data: urlData } = supabase
    .storage
    .from('imgproductos')
    .getPublicUrl(nombreArchivo);

  return urlData.publicUrl;
}

// Manejo de agregar producto con subida de imagen
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const categoria = document.getElementById('categoria').value;
  const descripcion = document.getElementById('descripcion').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const stock = parseInt(document.getElementById('stock').value);
  const archivo = document.getElementById('imagenArchivo').files[0];

    if (!archivo) {
    alert("Por favor selecciona una imagen.");
    return;
  }

  const nombreArchivo = `${Date.now()}_${archivo.name}`;
  const imagenURL = await subirImagenASupabase(archivo, nombreArchivo);

  if (!imagenURL) {
    alert("Error al subir imagen.");
    return;
  }
  const { error } = await supabase.from('productos').insert([{
    nombre, categoria, descripcion, precio, stock, imagen_url: imagenURL
  }]);

  if (error) {
    alert('Error al agregar: ' + error.message);
  } else {
    alert('Producto agregado');
    form.reset();
    cargarProductos();
  }
});
document.getElementById('formEditarProducto').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editarId').value;
  const nombre = document.getElementById('editarNombre').value;
  const categoria = document.getElementById('editarCategoria').value;
  const descripcion = document.getElementById('editarDescripcion').value;
  const precio = parseFloat(document.getElementById('editarPrecio').value);
  const stock = parseInt(document.getElementById('editarStock').value);
  const archivoNuevo = document.getElementById('editarImagenArchivo').files[0];

  let imagenURL = null;

  // Si hay nueva imagen, se sube y se reemplaza
 
  if (archivoNuevo) {
    const nombreArchivo = `${Date.now()}_${archivoNuevo.name}`;
    imagenURL = await subirImagenASupabase(archivoNuevo, nombreArchivo);
    if (!imagenURL) {
      alert("Error al subir imagen.");
      return;
    }
  }

  const actualizacion = {
    nombre, categoria, descripcion, precio, stock
  };

  if (imagenURL) {
    actualizacion.imagen_url = imagenURL;
  }

  const { error } = await supabase.from('productos').update(actualizacion).eq('id', id);
  if (error) {
    alert('Error al actualizar: ' + error.message);
  } else {
    alert('Producto actualizado');
    document.getElementById('modalEditar').classList.add('oculto');
    cargarProductos();
  }
});

// Cancelar edición
document.getElementById('cancelarEditar').addEventListener('click', () => {
  document.getElementById('modalEditar').classList.add('oculto');
});
// Cerrar sesión (placeholder)
document.getElementById('cerrarSesionAdmin').addEventListener('click', () => {
  alert('Cerrar sesión');
});

// Iniciar carga inicial

 
//});
async function marcarEntregado(pedidoId) {
  const { error } = await supabase
    .from('pedidos')
    .update({ estado: 'entregado' })
    .eq('id', pedidoId);

  if (error) {
    alert('Error al actualizar el estado del pedido');
  } else {
    alert('Pedido marcado como entregado');
    cargarPedidos();
  }
}

async function cargarPedidos() {
  const pedidosContainer = document.getElementById('adminListaPedidos');
  pedidosContainer.innerHTML = '';

  // 1. Obtener todos los pedidos
  const { data: pedidos, error: errorPedidos } = await supabase
    .from('pedidos')
    .select('*')
    .order('fecha', { ascending: false });

  if (errorPedidos) {
    console.error('❌ Error al cargar pedidos:', errorPedidos.message);
    pedidosContainer.innerHTML = '<p>Error al cargar pedidos</p>';
    return;
  }

  if (pedidos.length === 0) {
    pedidosContainer.innerHTML = '<p>No hay pedidos aún</p>';
    return;
  }

  for (const pedido of pedidos) {
    // 2. Obtener detalle de ese pedido desde `detalle_pedido`
    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalle_pedido')
      .select('*')
      .eq('pedido_id', pedido.id);

    if (errorDetalles) {
      console.warn(`⚠️ Error obteniendo detalle del pedido ${pedido.id}:`, errorDetalles.message);
      continue;
    }

    // 3. Armar HTML del detalle
    let productosHTML = '<ul>';
    for (const item of detalles) {
      productosHTML += `<li>${item.nombre} x${item.cantidad} - S/ ${item.precio_unitario}</li>`;
    }
    productosHTML += '</ul>';

    // 4. Armar HTML del pedido completo
    const div = document.createElement('div');
    div.className = 'admin-pedido';

    div.innerHTML = `
      <p><strong>Cliente:</strong> ${pedido.nombre_cliente}</p>
      <p><strong>Correo:</strong> ${pedido.email}</p>
      <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
      <p><strong>Dirección:</strong> ${pedido.direccion}</p>
      <p><strong>Notas:</strong> ${pedido.notas || 'Ninguna'}</p>
      <p><strong>Método de pago:</strong> ${pedido.metodo_pago}</p>
      <p><strong>Estado:</strong> ${pedido.estado}</p>
      <p><strong>Total:</strong> S/ ${pedido.total.toFixed(2)}</p>
      <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
      <p><strong>Productos:</strong> ${productosHTML}</p>
      <button onclick="marcarEntregado(${pedido.id})">Marcar como entregado</button>
      <hr>
    `;

    pedidosContainer.appendChild(div);
  }
}

async function cargarProductos() {
  const contenedor = document.getElementById('adminListaProductos');
  contenedor.innerHTML = '';

  const busqueda = document.getElementById('buscarProducto')?.value?.toLowerCase() || '';
  const categoriaSeleccionada = document.getElementById('filtrarCategoria')?.value || '';

  const { data, error } = await supabase.from('productos').select('*');

  if (error) {
    alert("Error cargando productos");
    return;
  }

  // 🔍 Filtro por nombre y categoría
  const filtrados = data.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda);
    const coincideCategoria = categoriaSeleccionada ? p.categoria === categoriaSeleccionada : true;
    return coincideNombre && coincideCategoria;
  });

  if (filtrados.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  for (const prod of filtrados) {
    let imagenURL = 'images/placeholder.webp';
    if (prod.imagen_url) {
      imagenURL = `https://twznikjjvtoedfaxbuvf.supabase.co/storage/v1/object/public/imgproductos/${prod.imagen_url}`;
    }

    const div = document.createElement('div');
    div.className = 'admin-producto';
    div.innerHTML = `
      <h3>${prod.nombre}</h3>
      <p>Precio: S/ ${prod.precio}</p>
      <p>Stock: ${prod.stock}</p>
      <p>Categoría: ${prod.categoria}</p>
      <img src="${imagenURL}" alt="${prod.nombre}" width="100" onerror="this.src='img/error-img.webp';" />
      <button onclick="editarProducto(${prod.id})">Editar</button>
      <button onclick="eliminarProducto(${prod.id})">Eliminar</button>
    `;
    contenedor.appendChild(div);
  }
}


// Mostrar modal con los datos del producto a editar
window.editarProducto = async function (id) {
  const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();

  if (error) {
    alert("Error al cargar producto: " + error.message);
    return;
  }

  document.getElementById('editarId').value = data.id;
  document.getElementById('editarNombre').value = data.nombre;
  document.getElementById('editarCategoria').value = data.categoria;
  document.getElementById('editarDescripcion').value = data.descripcion;
  document.getElementById('editarPrecio').value = data.precio;
  document.getElementById('editarStock').value = data.stock;

  document.getElementById('modalEditar').classList.remove('oculto');
};


window.eliminarProducto = async function (id) {
  if (!confirm('¿Eliminar este producto?')) return;

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) alert('Error eliminando: ' + error.message);
  else cargarProductos();
};

// Iniciar verificación de acceso
verificarAdmin();

// Búsqueda y filtro
document.getElementById('buscarProducto').addEventListener('input', () => cargarProductos());
document.getElementById('filtrarCategoria').addEventListener('change', () => cargarProductos());

// Alternar entre secciones
const btnProductos = document.getElementById("btnProductos");
const btnPedidos = document.getElementById("btnPedidos");

btnProductos.addEventListener("click", () => {
  document.querySelector(".admin-agregar").style.display = "block";
  document.querySelector(".admin-productos").style.display = "block";
  document.querySelector(".admin-pedidos").style.display = "none";
  btnProductos.classList.add("activo");
  btnPedidos.classList.remove("activo");
});

btnPedidos.addEventListener("click", () => {
  document.querySelector(".admin-agregar").style.display = "none";
  document.querySelector(".admin-productos").style.display = "none";
  document.querySelector(".admin-pedidos").style.display = "block";
  btnPedidos.classList.add("activo");
  btnProductos.classList.remove("activo");
});

// Mostrar productos por defecto al cargar
window.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".admin-agregar").style.display = "block";
  document.querySelector(".admin-productos").style.display = "block";
  document.querySelector(".admin-pedidos").style.display = "none";
  btnProductos.classList.add("activo");
});

