const $inputBusqueda = document.getElementById("input-busqueda-cripto");
const $btnBuscar = document.getElementById("btn-buscar-cripto");
const $contenedorGrafico = document.getElementById("contenedor-grafico");
const API_URL = import.meta.env.VITE_API_URL;

async function graficarUltimaSemana(cripto) {
  try {
    const res = await fetch(
      `${API_URL}/coins/${cripto.toLowerCase()}/market_chart?vs_currency=usd&days=7`,
    );
    if (!res.ok) throw new Error("Cripto no encontrada");

    const data = await res.json();
    dibujarSVG(data.prices);
  } catch (error) {
    errores($contenedorGrafico, "No se encontró el activo.");
  }
}

function dibujarSVG(precios) {
  const ancho = 800; // Ancho virtual del SVG
  const alto = 300; // Alto virtual del SVG

  // Extraemos solo los valores de precio (índice 1 de cada array)
  const valores = precios.map((p) => p[1]);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min;

  // Transformamos cada punto [timestamp, precio] a coordenadas [x, y]
  const puntos = precios
    .map((p, i) => {
      // X: se distribuye proporcionalmente según la cantidad de datos
      const x = (i / (precios.length - 1)) * ancho;

      // Y: La lógica invertida.
      // Restamos 'alto' porque en SVG el 0 está arriba.
      // Si el precio es el máximo, Y debe ser 0 (arriba).
      // Si el precio es el mínimo, Y debe ser 300 (abajo).
      const y = alto - ((p[1] - min) / rango) * alto;

      return `${x},${y}`;
    })
    .join(" ");

  $contenedorGrafico.innerHTML = `
    <svg viewBox="0 0 ${ancho} ${alto}" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
      <polyline 
        points="${puntos}" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="2" 
        vector-effect="non-scaling-stroke"
      />
    </svg>
  `;
}

$btnBuscar.addEventListener("click", () => {
  const nombre = $inputBusqueda.value.trim();
  if (nombre) graficarUltimaSemana(nombre);
});

// Carga inicial (Bitcoin por defecto)
graficarUltimaSemana("bitcoin");
