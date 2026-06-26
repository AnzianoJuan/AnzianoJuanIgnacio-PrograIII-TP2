import { Chart } from "chart.js/auto";
import { errores } from "@/errores.js";
import { getElemById } from "@/getElements.js";
import { graficarUltimaSemana } from "@/services/ChartServices.js";

const $inputBusqueda = getElemById("input-busqueda-cripto");
const $btnBuscar = getElemById("btn-buscar-cripto");
const $contenedorGrafico = getElemById("contenedor-grafico");
const $statNombre = getElemById("stat-nombre");
const $statPrecio = getElemById("stat-precio");
const $statVolumen = getElemById("stat-volumen");
const $statMarketCap = getElemById("stat-marketcap");
const $colorGrafico = getElemById("color-grafico");

let graficoActual = null;
let ultimosPreciosGraficados = null; //  guardamos los precios para re-pintar sin re-buscar

// Leemos el color guardado, o usamos el naranja actual como default
const colorGuardado = localStorage.getItem("colorGrafico") || "#cf6e00";
$colorGrafico.value = colorGuardado;

function formatearFecha(timestamp) {
  const fecha = new Date(timestamp);
  return fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function hexConOpacidad(hex, opacidad) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
}

async function graficarCripto(cripto) {
  try {
    const { prices, total_volumes, market_caps } =
      await graficarUltimaSemana(cripto);
    dibujarGrafico(prices);
    mostrarEstadisticas(cripto, prices, total_volumes, market_caps);
  } catch (error) {
    errores($contenedorGrafico, "No se encontró el activo.");
    console.error(error);
  }
}

function mostrarEstadisticas(cripto, precios, volumenes, marketCaps) {
  const precioActual = precios[precios.length - 1][1];
  const volumenActual = volumenes[volumenes.length - 1][1];
  const marketCapActual = marketCaps[marketCaps.length - 1][1];

  $statNombre.textContent = cripto.toUpperCase();
  $statPrecio.textContent = `$${precioActual.toLocaleString()}`;
  $statVolumen.textContent = `$${volumenActual.toLocaleString()}`;
  $statMarketCap.textContent = `$${marketCapActual.toLocaleString()}`;
}

function dibujarGrafico(precios) {
  ultimosPreciosGraficados = precios; //  guardamos para poder re-pintar después

  $contenedorGrafico.innerHTML = `<canvas id="grafico-precios"></canvas>`;
  const $canvas = getElemById("grafico-precios");

  const etiquetas = precios.map((p) => formatearFecha(p[0]));
  const valores = precios.map((p) => p[1]);
  const colorActual = $colorGrafico.value;

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
          borderColor: colorActual,
          backgroundColor: hexConOpacidad(colorActual, 0.15),
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
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
            callback: (v) => `$${v.toLocaleString()}`,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (ctx) => ctx[0].label,
            label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
    },
  });
}

$btnBuscar.addEventListener("click", () => {
  const nombre = $inputBusqueda.value.trim();
  if (nombre) {
    graficarCripto(nombre);
  }
});

$colorGrafico.addEventListener("change", () => {
  localStorage.setItem("colorGrafico", $colorGrafico.value);

  if (ultimosPreciosGraficados) {
    dibujarGrafico(ultimosPreciosGraficados);
  }
});

graficarCripto("bitcoin");
