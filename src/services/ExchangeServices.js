const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

//obtengo los exchanges
export async function obtenerExchanges() {
    const res = await fetch(`${API_URL}/exchanges?per_page=20&page=1`,{
    headers: { "x-cg-demo-api-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error("Error en la carga de exchanges");
  }

  return res.json();
}
