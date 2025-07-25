// admin.js
import { supabase } from './supabaseClient.js';

const form = document.getElementById('agregarProductoForm');
const adminLista = document.getElementById('adminListaProductos');
const cerrarSesionAdmin = document.getElementById('cerrarSesionAdmin');

cerrarSesionAdmin.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const categoria = document.getElementById('categoria').value;
  const descripcion = document.getElementById('descripcion').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const stock = parseInt(document.getElementById('stock').value);
  const imagen = document.getElementById('imagen').value;

  const { error } = await supabase.from('Productos').insert([
    { nombre, categoria, descripcion, precio, stock, imagen }
  ]);

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
  if (error) return;

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

cargarProductos();
