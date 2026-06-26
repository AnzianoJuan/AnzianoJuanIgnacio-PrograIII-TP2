const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// busca por nombre
export async function buscarCriptoPorNombre(nombre) {
  const resBusqueda = await fetch(`${API_URL}/search?query=${nombre}`, {
    headers: { "x-cg-demo-api-key": API_KEY },
  });
  if (!resBusqueda.ok) {
    throw new Error("Error en la búsqueda");
  }
  //primero filtro con el id
  const dataBusqueda = await resBusqueda.json();
  if (dataBusqueda.coins.length === 0) {
    return null;
  }

  const idCorrecto = dataBusqueda.coins[0].id;
  //luego lo busco , porque atraves de id , porque pueden haber errores
  const res = await fetch(`${API_URL}/coins/${idCorrecto}`, {
    headers: { "x-cg-demo-api-key": API_KEY },
  });
  
  if (!res.ok) {
    throw new Error("Error en la api");
  }

  return res.json();
}
