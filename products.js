import { supabase } from "./supabaseClient.js";

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
