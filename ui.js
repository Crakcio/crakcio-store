// ui.js

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
