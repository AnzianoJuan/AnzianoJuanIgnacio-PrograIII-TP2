const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

//detalle de la cripto elegida
export async function obtenerDetalleCripto(id) {
  const res = await fetch(`${API_URL}/coins/${id}`, {
    headers: { "x-cg-demo-api-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error("No se encontró la cripto");
  }
  return res.json();
}
