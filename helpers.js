// helpers.js

// ------------------------
// Funciones de utilidad
// ------------------------

/**
 * Formatea el precio en soles peruanos (S/).
 * @param {number} precio
 * @returns {string}
 */
export function formatearPrecio(precio) {
  return `S/ ${precio.toFixed(2)}`;
}

/**
 * Muestra una alerta temporal en la pantalla.
 * @param {string} mensaje
 * @param {'success'|'error'} tipo
 */
export function mostrarAlerta(mensaje, tipo = "success") {
  const alerta = document.createElement("div");
  alerta.textContent = mensaje;
  alerta.className = `alerta alerta-${tipo}`;
  document.body.appendChild(alerta);

  setTimeout(() => {
    alerta.remove();
  }, 3000);
}

/**
 * Guarda un objeto en localStorage.
 * @param {string} clave
 * @param {any} valor
 */
export function guardarEnLocalStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

/**
 * Obtiene un objeto desde localStorage.
 * @param {string} clave
 * @returns {any}
 */
export function obtenerDeLocalStorage(clave) {
  const item = localStorage.getItem(clave);
  return item ? JSON.parse(item) : null;
}

/**
 * Limpia un contenedor HTML por ID.
 * @param {string} id
 */
export function limpiarContenedor(id) {
  const contenedor = document.getElementById(id);
  if (contenedor) contenedor.innerHTML = "";
}
