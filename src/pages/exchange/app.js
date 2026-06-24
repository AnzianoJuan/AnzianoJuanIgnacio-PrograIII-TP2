// src/pages/exchange/app.js
import { errores } from "@/errores.js";
import { getElemById } from "@/getElements.js";
import { obtenerExchanges } from "@/services/ExchangeServices.js";

const $exchangesGrid = getElemById("exchanges-grid");

async function getExchanges() {
  try {
    const data = await obtenerExchanges();
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
  exchanges.forEach(
    ({
      trust_score_rank,
      image,
      name,
      country,
      trust_score,
      trade_volume_24h_btc,
    }) => {
      html += `
      <div class="exchange-card">
        <div class="exchange-card-header">
          <span class="exchange-rank">#${trust_score_rank}</span>
          <img class="exchange-img" src="${image}" alt="${name}" />
          <div>
            <p class="exchange-nombre">${name}</p>
            <p class="exchange-pais">${country || "País no especificado"}</p>
          </div>
        </div>
        <div class="exchange-card-body">
          <span class="badge ${claseConfianza(trust_score)}"> 
            Confianza: ${trust_score}/10
          </span>
          <p class="exchange-volumen">
            Volumen 24h: ${trade_volume_24h_btc.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC
          </p>
        </div>
      </div>
    `;
    },
  );

  $exchangesGrid.innerHTML = html;
}

getExchanges();
