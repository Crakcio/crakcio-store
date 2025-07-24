// ui.js

export function mostrarSeccion(id) {
  const secciones = document.querySelectorAll('section');
  secciones.forEach((seccion) => {
    seccion.style.display = 'none';
  });

  const seccionActiva = document.getElementById(id);
  if (seccionActiva) {
    seccionActiva.style.display = 'block';
  }
}

export function mostrarElemento(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

export function ocultarElemento(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

export function cambiarTexto(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

export function limpiarFormulario(idFormulario) {
  const form = document.getElementById(idFormulario);
  if (form) form.reset();
}
