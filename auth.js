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

if (error) {
  if (error.message.includes("User already registered")) {
    alert("❌ Este correo ya está registrado. Usa otro o inicia sesión.");
  } else {
    alert("❌ Error al registrarse: " + error.message);
  }
  return;
}

if (!data.user) {
  alert("❌ No se pudo crear el usuario.");
  return;
}


  const userId = data.user.id;

  // Guardar el rol del nuevo usuario como "cliente", junto con el nombre
  const { error: errorInsert } = await supabase.from('usuarios').insert([
    { id: userId, email, nombre, rol: 'cliente' }
  ]);

  if (errorInsert) {
  console.error("🛠️ Error técnico al insertar en tabla usuarios:", errorInsert);
  alert('❌ Usuario registrado en Auth, pero ocurrió un problema técnico al guardarlo. Revisa consola para más detalles.');
  return;
}


  // ✅ Solo si todo salió bien
  alert('✅ Registro exitoso. Ya puedes iniciar sesión.');
  window.location.href = "cliente.html";
});

});
