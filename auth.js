// auth.js
import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const mostrarRegistro = document.getElementById('mostrarRegistro');
  const cerrarRegistro = document.getElementById('cerrarRegistro');
  const registroModal = document.getElementById('registroModal');

  mostrarRegistro?.addEventListener('click', () => {
    registroModal.classList.remove('hidden');
  });

  cerrarRegistro?.addEventListener('click', () => {
    registroModal.classList.add('hidden');
  });

  // LOGIN
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      alert('Error al iniciar sesión: ' + (error?.message || "Usuario inválido"));
      return;
    }

    const userId = data.user.id;

    // Obtener el rol desde la tabla usuarios
    const { data: perfil, error: errorPerfil } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single();

    if (errorPerfil || !perfil) {
      alert('No se pudo verificar el rol del usuario.');
      return;
    }

    if (perfil.rol === 'admin') {
      window.location.href = 'admin.html';
    } else if (perfil.rol === 'cliente') {
      window.location.href = 'cliente.html';
    } else {
      alert('Rol no reconocido');
    }
  });

  // REGISTRO
registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const nombre = document.getElementById('registerNombre').value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    alert('❌ Error al registrarse: ' + (error?.message || "Desconocido"));
    return;
  }

  const userId = data.user.id;

  // Guardar el rol del nuevo usuario como "cliente", junto con el nombre
  const { error: errorInsert } = await supabase.from('usuarios').insert([
    { id: userId, email, nombre, rol: 'cliente' }
  ]);

  if (errorInsert) {
    alert('❌ Usuario creado en auth, pero no guardado en la base de datos: ' + errorInsert.message);
    // Opcional: puedes eliminar al usuario creado en auth si quieres evitar usuarios huérfanos
    return;
  }

  // ✅ Solo si todo salió bien
  alert('✅ Registro exitoso. Ya puedes iniciar sesión.');
  window.location.href = "cliente.html";
});

});
