import { errores } from "./errores.js";
import { getElemById } from "./getElements.js";

const $exchangesGrid = getElemById("exchanges-grid");
const API_URL = import.meta.env.VITE_API_URL;

async function obtenerExchanges() {
  try {
    const res = await fetch(`${API_URL}/exchanges?per_page=20&page=1`);
    if (!res.ok) {
      throw new Error("Error en la api de exchanges");
    }

    const data = await res.json();
    renderizarExchanges(data); // ya viene ordenado por trust_score_rank
  } catch (error) {
    errores($exchangesGrid, " al cargar los exchanges");
    console.error(error);
  }
}

// Devuelve una clase distinta según el nivel de confianza, para pintar el badge, permitiendo modificar el css , atraves de template string
// que sale de exchange.css
function claseConfianza(trustScore) {
  if (trustScore >= 9) {
    return "badge-alta";
  }
  if (trustScore >= 5) {
    return "badge-media";
  }
  return "badge-baja";
}

function renderizarExchanges(exchanges) {
  let html = "";
  exchanges.forEach((exchange) => {
    html += `
      <div class="exchange-card">
        <div class="exchange-card-header">
          <span class="exchange-rank">#${exchange.trust_score_rank}</span>
          <img class="exchange-img" src="${exchange.image}" alt="${exchange.name}" />
          <div>
            <p class="exchange-nombre">${exchange.name}</p>
            <p class="exchange-pais">${exchange.country || "País no especificado"}</p>
          </div>
        </div>
        <div class="exchange-card-body">
          <span class="badge ${claseConfianza(exchange.trust_score)}"> 
            Confianza: ${exchange.trust_score}/10
          </span>
          <p class="exchange-volumen">
            Volumen 24h: ${exchange.trade_volume_24h_btc.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC
          </p>
        </div>
      </div>
    `;
  });

  $exchangesGrid.innerHTML = html;
}

obtenerExchanges();
