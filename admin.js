import { supabase } from './supabaseClient.js';

const form = document.getElementById('agregarProductoForm');
const adminLista = document.getElementById('adminListaProductos');
const cerrarSesionAdmin = document.getElementById('cerrarSesionAdmin');
const formEditar = document.getElementById('formEditarProducto');
const cancelarEditar = document.getElementById('cancelarEditar');

// Cerrar sesión
cerrarSesionAdmin.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
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

  const { data: subida, error: errorSubida } = await supabase
    .storage
    .from('imgproductos')
    .upload(nombreArchivo, archivo);

  if (errorSubida) {
    alert("Error al subir imagen: " + errorSubida.message);
    return;
  }

formEditar.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editarId').value;
  const nombre = document.getElementById('editarNombre').value;
  const categoria = document.getElementById('editarCategoria').value;
  const descripcion = document.getElementById('editarDescripcion').value;
  const precio = parseFloat(document.getElementById('editarPrecio').value);
  const stock = parseInt(document.getElementById('editarStock').value);
  const nuevaImagen = document.getElementById('editarImagenArchivo').files[0];

  let camposActualizados = { nombre, categoria, descripcion, precio, stock };

  // Si hay nueva imagen, se sube y se reemplaza
  if (nuevaImagen) {
    const nuevoNombreImagen = `${Date.now()}_${nuevaImagen.name}`;
    const { error: errorSubida } = await supabase
      .storage
      .from('imgproductos')
      .upload(nuevoNombreImagen, nuevaImagen);

    if (errorSubida) {
      alert('Error subiendo nueva imagen: ' + errorSubida.message);
      return;
    }

    const { data: urlData } = supabase
      .storage
      .from('imgproductos')
      .getPublicUrl(nuevoNombreImagen);

    camposActualizados.imagen = urlData.publicUrl;
  }

  const { error } = await supabase
    .from('productos')
    .update(camposActualizados)
    .eq('id', id);

  if (error) {
    alert('Error actualizando producto: ' + error.message);
  } else {
    alert('Producto actualizado');
    document.getElementById('modalEditar').classList.add('oculto');
    formEditar.reset();
    cargarProductos();
  }
});

// Cancelar edición
cancelarEditar.addEventListener('click', () => {
  document.getElementById('modalEditar').classList.add('oculto');
  formEditar.reset();
});
  // Obtener la URL pública correctamente
  const { data: urlData } = supabase
    .storage
    .from('imgproductos')
    .getPublicUrl(nombreArchivo);

  const imagenURL = urlData.publicUrl;

  const { error } = await supabase.from('productos').insert([{
    nombre, categoria, descripcion, precio, stock, imagen: imagenURL
  }]);

  if (error) {
    alert('Error al agregar: ' + error.message);
  } else {
    alert('Producto agregado');
    form.reset();
    cargarProductos();
  }
});
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

  const { data: pedidos, error } = await supabase.from('pedidos').select('*');

  if (error) {
    console.error('Error al cargar pedidos:', error.message);
    pedidosContainer.innerHTML = '<p>Error al cargar pedidos</p>';
    return;
  }

  if (pedidos.length === 0) {
    pedidosContainer.innerHTML = '<p>No hay pedidos aún</p>';
    return;
  }

  for (const pedido of pedidos) {
    const div = document.createElement('div');
    div.className = 'admin-pedido';

    // Formatear productos
    let productosHTML = '<ul>';
    try {
      const productos = JSON.parse(pedido.productos);
      for (const item of productos) {
        productosHTML += `<li>${item.nombre} x${item.cantidad} - S/ ${item.precio}</li>`;
      }
    } catch (e) {
      productosHTML = '<li>Error al leer productos</li>';
    }
    productosHTML += '</ul>';

    div.innerHTML = `
      <p><strong>Cliente:</strong> ${pedido.email || 'sin email'}</p>
      <p><strong>Estado:</strong> ${pedido.estado || 'pendiente'}</p>
      <p><strong>Productos:</strong> ${productosHTML}</p>
      <button onclick="marcarEntregado(${pedido.id})">Marcar como entregado</button>
    `;

    pedidosContainer.appendChild(div);
  }
}


async function cargarProductos() {
  adminLista.innerHTML = '';
  const { data, error } = await supabase.from('productos').select('*');
  if (error) {
    alert("Error cargando productos");
    return;
  }

  for (const prod of data) {
    let imagenURL = 'images/placeholder.webp'; // Imagen por defecto

    // Obtener URL pública desde Supabase si hay imagen
    if (prod.imagen_url) {
      const { data: urlData, error: imgError } = supabase
        .storage
        .from('imgproductos')
        .getPublicUrl(prod.imagen_url); // << Aquí se usa la ruta completa

      if (!imgError && urlData?.publicUrl) {
        imagenURL = urlData.publicUrl;
      }
    }

    const div = document.createElement('div');
    div.className = 'admin-producto';
    div.innerHTML = `
      <h3>${prod.nombre}</h3>
      <p>Precio: S/ ${prod.precio}</p>
      <p>Stock: ${prod.stock}</p>
      <p>Categoría: ${prod.categoria}</p>
      <img src="${imagenURL}" alt="${prod.nombre}" width="100" />
      <button onclick="editarProducto(${prod.id})">Editar</button>
      <button onclick="eliminarProducto(${prod.id})">Eliminar</button>
    `;
    adminLista.appendChild(div);
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
    .from('Productos')
    .delete()
    .eq('id', id);

  if (error) alert('Error eliminando: ' + error.message);
  else cargarProductos();
};

// Iniciar verificación de acceso
verificarAdmin();

