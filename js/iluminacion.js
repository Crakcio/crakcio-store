import { supabase } from '../supabaseClient.js';

console.log('JS ejecutado');

document.getElementById('productos').innerHTML = '<p style="color:red">Esto sí se está ejecutando</p>';

async function cargarProductosIluminacion() {
  let userRol = null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    const userId = sessionData.session.user.id;

    const { data: perfil } = await supabase
      .from('perfil')
      .select('rol')
      .eq('id', userId)
      .single();

    userRol = perfil?.rol || null;
  }

  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria', 'Iluminación');

  if (error) {
    console.error('Error al cargar productos:', error);
    return;
  }

  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = '';

  data.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'producto';
    card.innerHTML = `
      <img src="/images/${producto.imagen_url}" alt="${producto.nombre}" />
      <h3>${producto.nombre}</h3>
      <p>S/ ${producto.precio}</p>
      ${userRol === 'cliente' ? '<button>Añadir al carrito</button>' : ''}
    `;
    contenedor.appendChild(card);
  });
}

cargarProductosIluminacion();
