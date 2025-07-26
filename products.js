import { supabase } from "./supabaseClient.js";

const BUCKET_URL = "https://twznikjjvtoedfaxbuvf.supabase.co/storage/v1/object/public/imgproductos/";

// Reemplaza "xyz" con tu subdominio real de Supabase

export function obtenerUrlImagen(nombreArchivo) {
  if (!nombreArchivo) return "images/placeholder.webp"; // una imagen de respaldo local
  return BUCKET_URL + nombreArchivo;
}

// Función para obtener los productos
export async function obtenerProductos() {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    return [];
  }
}

// Función para obtener los productos más vendidos
export async function obtenerMasVendidos(limit = 4) {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("vendidos", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener más vendidos:", error.message);
    return [];
  }
}

// Función para obtener los productos más recientes
export async function obtenerMasRecientes(limit = 4) {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: false }) // Asumiendo que 'id' crece con cada producto
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener más recientes:", error.message);
    return [];
  }
}
export { obtenerUrlImagen };
