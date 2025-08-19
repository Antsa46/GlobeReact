import React from "react";

export default function SiteFooter() {
  return (
    <footer
      className="site-footer"
      role="contentinfo"
      aria-label="Aineistolähteet ja lisenssit"
    >
      <div className="site-footer__inner">
        <span>
          Rajat, valtiot & kaupungit:{" "}
          <a
            href="https://www.naturalearthdata.com/"
            target="_blank"
            rel="noreferrer"
            title="Natural Earth (Public Domain)"
          >
            Natural Earth
          </a>{" "}
          (Public Domain)
        </span>

        <span className="sep">•</span>

        <span>
          Väkiluku:{" "}
          <a
            href="https://databank.worldbank.org/source/world-development-indicators"
            target="_blank"
            rel="noreferrer"
            title="World Development Indicators – SP.POP.TOTL"
          >
            World Bank WDI (SP.POP.TOTL)
          </a>{" "}
          (
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
            title="Creative Commons Attribution 4.0"
          >
            CC&nbsp;BY&nbsp;4.0
          </a>
          )
        </span>

        <span className="sep">•</span>

        <span>
          Korkeusdata (Terrarium-laatat):{" "}
          <a
            href="https://registry.opendata.aws/terrain-tiles/"
            target="_blank"
            rel="noreferrer"
            title="Mapzen Terrain Tiles on AWS Open Data"
          >
            Mapzen Terrain Tiles (AWS)
          </a>{" "}
          — lähteet mm. USGS 3DEP/SRTM/GMTED2010 &amp; NOAA ETOPO1 — © Mapzen{" "}
          (
          <a
            href="https://tilezen.readthedocs.io/en/latest/attribution/"
            target="_blank"
            rel="noreferrer"
            title="Tilezen / Mapzen attribution -ohje"
          >
            attribution
          </a>
          )
        </span>
      </div>
    </footer>
  );
}
