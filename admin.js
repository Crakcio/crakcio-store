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
  const archivo = document.getElementById('imagenArchivo').files[0];

  if (!archivo) {
    alert('Debes seleccionar una imagen.');
    return;
  }

  const nombreArchivo = `${Date.now()}_${archivo.name}`;

  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('imgproductos')
    .upload(nombreArchivo, archivo);

  if (uploadError) {
    alert('Error subiendo imagen: ' + uploadError.message);
    return;
  }

  const { data: urlData } = supabase
    .storage
    .from('imgproductos')
    .getPublicUrl(nombreArchivo);

  const imagen = urlData.publicUrl;

  const { error } = await supabase.from('Productos').insert([{
    nombre,
    categoria,
    descripcion,
    precio,
    stock,
    imagen
  }]);

  if (error) {
    alert('Error al agregar producto: ' + error.message);
  } else {
    alert('Producto agregado correctamente.');
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

window.editarProducto = function (id) {
  const divProducto = [...adminLista.children].find(div => div.querySelector(`button[onclick="editarProducto(${id})"]`));

  // Evitar múltiples formularios
  const formExistente = divProducto.querySelector('.form-edicion');
  if (formExistente) {
    formExistente.remove();
    return;
  }

  // Obtener datos del producto actual
  const nombreActual = divProducto.querySelector('h3').innerText;
  const precioActual = divProducto.querySelector('p:nth-of-type(1)').innerText.replace('Precio: S/ ', '');
  const stockActual = divProducto.querySelector('p:nth-of-type(2)').innerText.replace('Stock: ', '');
  const categoriaActual = divProducto.querySelector('p:nth-of-type(3)').innerText.replace('Categoría: ', '');

  // Crear formulario de edición
  const form = document.createElement('form');
  form.className = 'form-edicion';
  form.innerHTML = `
    <input type="text" name="nombre" placeholder="Nombre" value="${nombreActual}" required />
    <input type="number" name="precio" placeholder="Precio" value="${precioActual}" required />
    <input type="number" name="stock" placeholder="Stock" value="${stockActual}" required />
    <input type="text" name="categoria" placeholder="Categoría" value="${categoriaActual}" required />
    <button type="submit">Guardar</button>
    <button type="button" class="cancelar">Cancelar</button>
  `;

  form.querySelector('.cancelar').addEventListener('click', () => {
    form.remove();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = form.nombre.value;
    const precio = parseFloat(form.precio.value);
    const stock = parseInt(form.stock.value);
    const categoria = form.categoria.value;

    const { error } = await supabase
      .from('Productos')
      .update({ nombre, precio, stock, categoria })
      .eq('id', id);

    if (error) {
      alert('Error al guardar: ' + error.message);
    } else {
      cargarProductos();
    }
  });

  divProducto.appendChild(form);
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
