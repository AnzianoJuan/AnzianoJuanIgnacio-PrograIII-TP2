const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function obtenerMercado(page = 1) {
  const res = await fetch(
    `${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${page}`,
    {
      headers: { "x-cg-demo-api-key": API_KEY },
    },
  );
  if (!res.ok) throw new Error("Error en la api");
  return res.json();
}