import { supabase } from './supabaseClient.js';

const form = document.getElementById('agregarProductoForm');
const adminLista = document.getElementById('adminListaProductos');
const cerrarSesionAdmin = document.getElementById('cerrarSesionAdmin');

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
  const { data: subida, error: errorSubida } = await supabase.storage
    .from('imgproductos')
    .upload(nombreArchivo, archivo);

  if (errorSubida) {
    alert("Error al subir imagen: " + errorSubida.message);
    return;
  }

  const imagenURL = `https://twznikjjvtoedfaxbuvf.supabase.co/storage/v1/object/public/imgproductos/${nombreArchivo}`;

  const { error } = await supabase.from('Productos').insert([{
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

async function cargarProductos() {
  adminLista.innerHTML = '';
  const { data, error } = await supabase.from('Productos').select('*');
  if (error) {
    alert("Error cargando productos");
    return;
  }

  data.forEach(prod => {
    const div = document.createElement('div');
    div.className = 'admin-producto';
    div.innerHTML = `
      <h3>${prod.nombre}</h3>
      <p>Precio: S/ ${prod.precio}</p>
      <p>Stock: ${prod.stock}</p>
      <p>Categoría: ${prod.categoria}</p>
      <img src="${prod.imagen}" alt="${prod.nombre}" width="100" />
      <button onclick="editarProducto(${prod.id})">Editar</button>
      <button onclick="eliminarProducto(${prod.id})">Eliminar</button>
    `;
    adminLista.appendChild(div);
  });
}

window.editarProducto = async function (id) {
  const nuevoNombre = prompt('Nuevo nombre:');
  if (!nuevoNombre) return;

  const { error } = await supabase
    .from('Productos')
    .update({ nombre: nuevoNombre })
    .eq('id', id);

  if (error) alert('Error actualizando: ' + error.message);
  else cargarProductos();
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

