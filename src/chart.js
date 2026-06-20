import { Chart } from "chart.js/auto";
import { errores } from "./errores.js";
import { getElemById } from "./getElements.js";

const $inputBusqueda = getElemById("input-busqueda-cripto");
const $btnBuscar = getElemById("btn-buscar-cripto");
const $contenedorGrafico = getElemById("contenedor-grafico");
const API_URL = import.meta.env.VITE_API_URL;

let graficoActual = null;

function formatearFecha(timestamp) {
  const fecha = new Date(timestamp);
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

async function graficarUltimaSemana(cripto) {
  try {
    const resBusqueda = await fetch(`${API_URL}/search?query=${cripto}`);

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
    dibujarGrafico(data.prices);
  } catch (error) {
    errores($contenedorGrafico, "No se encontró el activo.");
    console.error(error);
  }
}

function dibujarGrafico(precios) {
  // Recreamos el canvas en cada render (por si antes había un mensaje de error ahí)
  $contenedorGrafico.innerHTML = `<canvas id="grafico-precios"></canvas>`;
  const $canvas = getElemById("grafico-precios");

  const etiquetas = precios.map((p) => formatearFecha(p[0])); // fechas
  const valores = precios.map((p) => p[1]); // precios

  // Si ya había un gráfico previo, lo destruimos para liberar memoria
  // (si no, queda "escuchando" eventos de un canvas que ya no existe)
  if (graficoActual) {
    graficoActual.destroy();
  }

  graficoActual = new Chart($canvas, {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: "Precio (USD)",
          data: valores,
          borderColor: "#cf6e00",
          backgroundColor: "rgba(207, 110, 0, 0.15)",
          fill: true,
          tension: 0.3, // curva suave en vez de líneas rectas
          pointRadius: 0, // oculta los puntos por defecto
          pointHoverRadius: 5, // aparecen al pasar el mouse
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: { maxTicksLimit: 7, color: "#9a9a9a" },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: {
            color: "#9a9a9a",
            callback: (valor) => `$${valor.toLocaleString()}`,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // esto es lo que ves al pasar el mouse: precio + fecha
            title: (contexto) => contexto[0].label,
            label: (contexto) => `$${contexto.parsed.y.toLocaleString()}`,
          },
        },
      },
    },
  });
}

$btnBuscar.addEventListener("click", () => {
  const nombre = $inputBusqueda.value.trim();
  if (nombre) {
    graficarUltimaSemana(nombre); //si es un truhty , entra
  }
});

graficarUltimaSemana("bitcoin"); // pongo aca un valor por default asi queda piola
