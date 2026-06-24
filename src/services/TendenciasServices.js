const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function obtenerTendencias() {
  const res = await fetch(`${API_URL}/search/trending`, {
    headers: { "x-cg-demo-api-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error("error con la api");
  }

  const data = await res.json();
  return data.coins;
}
