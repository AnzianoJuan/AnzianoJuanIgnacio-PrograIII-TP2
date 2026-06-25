import { errores } from "@/errores.js";
import { getElemById } from "@/getElements.js";
import { obtenerDetalleCripto } from "@/services/DetalleCriptoServices.js";

const $contenedor = getElemById("detalle-cripto-contenedor");

const url = new URL(window.location.href);
const id = url.searchParams.get("id");

function renderizarDetalle({
  name,
  symbol,
  image: { large },
  description: { en: descripcion },
  market_data: {
    current_price: { usd },
    market_cap_rank,
    market_cap: { usd: marketCap },
    total_volume: { usd: volumen24h },
    price_change_percentage_24h,
    circulating_supply,
    max_supply,
    ath: { usd: maximoHistorico },
  },
}) {
  const esPositiva = price_change_percentage_24h > 0;
  const claseVariacion = esPositiva ? "variacion-positiva" : "variacion-negativa";
  const signo = esPositiva ? "+" : "";

  $contenedor.innerHTML = `
    <section class="seccion-detalle">
      <div class="cripto-detalle">
        <div class="cripto-detalle-header">
          <img src="${large}" alt="${name}" class="cripto-detalle-img" />
          <div>
            <h3 class="cripto-detalle-nombre">${name} <span class="rank-badge">#${market_cap_rank}</span></h3>
            <p class="cripto-detalle-simbolo">${symbol.toUpperCase()}</p>
          </div>
        </div>

        <div class="cripto-detalle-datos">
          <div class="cripto-detalle-card">
            <p class="cripto-detalle-label">Precio actual</p>
            <p class="cripto-detalle-valor">$${usd.toLocaleString()}</p>
          </div>
          <div class="cripto-detalle-card">
            <p class="cripto-detalle-label">Variación 24h</p>
            <p class="cripto-detalle-valor ${claseVariacion}">
              ${signo}${price_change_percentage_24h.toFixed(2)}%
            </p>
          </div>
          <div class="cripto-detalle-card">
            <p class="cripto-detalle-label">Market Cap</p>
            <p class="cripto-detalle-valor">$${marketCap.toLocaleString()}</p>
          </div>
          <div class="cripto-detalle-card">
            <p class="cripto-detalle-label">Volumen 24h</p>
            <p class="cripto-detalle-valor">$${volumen24h.toLocaleString()}</p>
          </div>
          <div class="cripto-detalle-card">
            <p class="cripto-detalle-label">Máximo histórico</p>
            <p class="cripto-detalle-valor">$${maximoHistorico.toLocaleString()}</p>
          </div>
          <div class="cripto-detalle-card">
            <p class="cripto-detalle-label">Suministro circulante</p>
            <p class="cripto-detalle-valor">${circulating_supply.toLocaleString()}</p>
          </div>
        </div>

        <div class="cripto-detalle-descripcion">
          <p class="cripto-detalle-label">Acerca de ${name}</p>
          <p>${descripcion || "Sin descripción disponible."}</p>
        </div>
      </div>
    </section>
  `;
}

if (!id) {
  errores($contenedor, " no se especificó ninguna cripto");
} else {
  obtenerDetalleCripto(id)
    .then(renderizarDetalle)
    .catch((error) => {
      errores($contenedor, " no se encontró la cripto solicitada");
      console.error(error);
    });
}