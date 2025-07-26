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

async function cargarPedidos() {
  const pedidosContainer = document.getElementById('adminListaPedidos');
  pedidosContainer.innerHTML = '';

  const { data, error } = await supabase.from('pedidos').select('*').order('fecha', { ascending: false });

  if (error) {
    pedidosContainer.innerHTML = '<p>Error al cargar pedidos</p>';
    return;
  }

  for (const pedido of data) {
    const div = document.createElement('div');
    div.className = 'admin-pedido';
    const fechaFormateada = new Date(pedido.fecha).toLocaleString();
    
    div.innerHTML = `
      <h4>Pedido ID: ${pedido.id}</h4>
      <p>Usuario: ${pedido.usuario_id}</p>
      <p>Fecha: ${fechaFormateada}</p>
      <p>Total: S/ ${pedido.total.toFixed(2)}</p>
      <p>Productos:</p>
      <ul>
        ${pedido.productos.map(p => `
          <li>${p.nombre} - Cantidad: ${p.cantidad} - Precio: S/ ${p.precio}</li>
        `).join('')}
      </ul>
      <hr>
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

if (prod.imagen && typeof prod.imagen === 'string' && prod.imagen.trim() !== '') {
  imagenURL = prod.imagen;
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

