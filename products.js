import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configura Supabase
const supabaseUrl = "https://twznikjjvtoedfaxbuvf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3em5pa2pqdnRvZWRmYXhidXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTI1NDAsImV4cCI6MjA2ODg2ODU0MH0.aOQ10hq-syYqrenvFxveBQj6wKqdDtsDKfykSm42MFE"; // tu clave pública
const supabase = createClient(supabaseUrl, supabaseKey);

// URL base del bucket de imágenes
const baseImgUrl = `${supabaseUrl}/storage/v1/object/public/imgproductos`;

// Referencia al contenedor
const contenedor = document.getElementById("contenedor-productos");

async function cargarProductos() {
  try {
    const { data, error } = await supabase.from("productos").select("*");
    if (error) throw error;

    contenedor.innerHTML = ""; // Limpia el contenedor antes de agregar nuevos

    data.forEach((producto) => {
      const card = document.createElement("div");
      card.classList.add("producto-card");

      const img = document.createElement("img");
      img.src = producto.imagen
        ? `${baseImgUrl}/${producto.imagen}`
        : "img/error-img.webp";
      img.alt = producto.nombre;
      img.onerror = () => {
        if (!img.dataset.fallback) {
          img.src = "img/error-img.webp";
          img.dataset.fallback = "true";
        }
      };

      const nombre = document.createElement("h3");
      nombre.textContent = producto.nombre;

      const descripcion = document.createElement("p");
      descripcion.textContent = producto.descripcion || "Sin descripción";

      const precio = document.createElement("p");
      precio.classList.add("precio");
      precio.textContent = `S/ ${parseFloat(producto.precio).toFixed(2)}`;

      const stock = document.createElement("p");
      stock.classList.add("stock");
      stock.textContent = `Stock: ${producto.stock ?? 0}`;

      card.appendChild(img);
      card.appendChild(nombre);
      card.appendChild(descripcion);
      card.appendChild(precio);
      card.appendChild(stock);

      contenedor.appendChild(card);
    });

  } catch (err) {
    console.error("Error al cargar productos:", err.message);
    contenedor.innerHTML = `<p class="error">No se pudieron cargar los productos.</p>`;
  }
}

// Ejecutar al cargar
cargarProductos();
