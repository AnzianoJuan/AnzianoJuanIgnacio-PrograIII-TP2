import { Chart } from "chart.js/auto";
import { errores } from "@/errores.js";
import { getElemById } from "@/getElements.js";
import { graficarUltimaSemana } from "@/services/ChartServices.js";

// --- todo el dom aca , con la funcion modular 
const $inputBusqueda = getElemById("input-busqueda-cripto");
const $btnBuscar = getElemById("btn-buscar-cripto");
const $contenedorGrafico = getElemById("contenedor-grafico");
const $statNombre = getElemById("stat-nombre");
const $statPrecio = getElemById("stat-precio");
const $statVolumen = getElemById("stat-volumen");
const $statMarketCap = getElemById("stat-marketcap");
const $colorGrafico = getElemById("color-grafico");
const $botonesTiempo = document.querySelectorAll(".btn-tiempo[data-dias]"); 

let graficoActual = null;
let ultimosPreciosGraficados = null;
let criptoActual = "bitcoin"; //  guardamos cuál cripto está graficada ahora
let diasActuales = 7; //  guardamos el rango actual

//guardo en el local storage el valor de color del grafico
const colorGuardado = localStorage.getItem("colorGrafico") || "#cf6e00";
$colorGrafico.value = colorGuardado;

//fromateo la fecha
function formatearFecha(timestamp) {
  const fecha = new Date(timestamp);
  return fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

// genera la opacidad del chart
function hexConOpacidad(hex, opacidad) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacidad})`;
}

async function graficarCripto(cripto, dias = diasActuales) {
  try {
    criptoActual = cripto; 
    diasActuales = dias; 

    const { prices, total_volumes, market_caps } = await graficarUltimaSemana(
      cripto,// destructuring de la respuesta
      dias,
    );
    dibujarGrafico(prices);
    mostrarEstadisticas(cripto, prices, total_volumes, market_caps);
  } catch (error) {
    errores($contenedorGrafico, "No se encontró el activo.");
    console.error(error);
  }
}

//muestra las estadisticas de la cripto
function mostrarEstadisticas(cripto, precios, volumenes, marketCaps) {
  const precioActual = precios[precios.length - 1][1];
  const volumenActual = volumenes[volumenes.length - 1][1];
  const marketCapActual = marketCaps[marketCaps.length - 1][1];

  //los carga para que se vean
  $statNombre.textContent = cripto.toUpperCase();
  $statPrecio.textContent = `$${precioActual.toLocaleString()}`;
  $statVolumen.textContent = `$${volumenActual.toLocaleString()}`;
  $statMarketCap.textContent = `$${marketCapActual.toLocaleString()}`;
}

// funcion dibujar grafico
function dibujarGrafico(precios) {
  ultimosPreciosGraficados = precios;

  $contenedorGrafico.innerHTML = `<canvas id="grafico-precios"></canvas>`;
  const $canvas = getElemById("grafico-precios");

  //mapea precios y valores
  const etiquetas = precios.map((p) => formatearFecha(p[0]));
  const valores = precios.map((p) => p[1]);
  const colorActual = $colorGrafico.value;

  if (graficoActual) {
    graficoActual.destroy();
  }//destruye si ya hay uno

  //esta es la config del grafico
  graficoActual = new Chart($canvas, {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: "Precio (USD)",
          data: valores,
          borderColor: colorActual,
          backgroundColor: hexConOpacidad(colorActual, 0.15),//llama a la funcion para que ponga el color
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

// se lanza el metodo buscar cuando hace click
$btnBuscar.addEventListener("click", () => {
  const nombre = $inputBusqueda.value.trim();//saca los espacios
  if (nombre) {
    graficarCripto(nombre, diasActuales);
  }
});

//cambia de color el grafico , este seria su evento
$colorGrafico.addEventListener("change", () => {
  localStorage.setItem("colorGrafico", $colorGrafico.value);//setea en localstorage

  if (ultimosPreciosGraficados) {
    dibujarGrafico(ultimosPreciosGraficados);//si es truty entra!
  }
});

//escucha el boton ara cambiar el tiempo del grafico 
$botonesTiempo.forEach((boton) => {
  boton.addEventListener("click", () => {
    $botonesTiempo.forEach((b) => b.classList.remove("activo"));
    boton.classList.add("activo");

    const dias = boton.dataset.dias;
    graficarCripto(criptoActual, dias);
  });
});

graficarCripto("bitcoin");
