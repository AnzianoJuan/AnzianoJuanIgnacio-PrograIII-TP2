const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function graficarUltimaSemana(cripto) {
  const resBusqueda = await fetch(`${API_URL}/search?query=${cripto}`, {
    headers: { "x-cg-demo-api-key": API_KEY },
  });

  if (!resBusqueda.ok) {
    throw new Error("Error en la búsqueda");
  }

  const dataBusqueda = await resBusqueda.json();
  if (dataBusqueda.coins.length === 0) {
    errores($contenedorGrafico, "No se encontró el activo.");
    return;
  }

  const idCorrecto = dataBusqueda.coins[0].id;
  // 2️ Ahora le pedimos el gráfico con el ID correcto
  const res = await fetch(
    `${API_URL}/coins/${idCorrecto}/market_chart?vs_currency=usd&days=7`,
  );

  if (!res.ok) {
    throw new Error("Cripto no encontrada");
  }
  const data = await res.json();
  return data;
}
