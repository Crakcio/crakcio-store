// auth.js
import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const mostrarRegistro = document.getElementById('mostrarRegistro');
  const cerrarRegistro = document.getElementById('cerrarRegistro');
  const registroModal = document.getElementById('registroModal');

  mostrarRegistro.addEventListener('click', () => {
    registroModal.classList.remove('hidden');
  });

  cerrarRegistro.addEventListener('click', () => {
    registroModal.classList.add('hidden');
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
      return;
    }

    const { user } = data;
    const adminEmail = 'admin@crackio.com';
    if (user.email === adminEmail) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert('Error al registrarse: ' + error.message);
    } else {
      alert('Registro exitoso. Ya puedes iniciar sesión.');
      registroModal.classList.add('hidden');
    }
  });
});
