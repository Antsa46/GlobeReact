import React from "react";

export default function CreditsFooter() {
  return (
    <div className="credits-footer" role="contentinfo" aria-label="Data sources and licenses">
      <span>
        Borders, countries & cities:{" "}
        <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">
          Natural Earth
        </a>{" "}
        (Public Domain)
      </span>
      <span className="sep">•</span>
      <span>
        Population:{" "}
        <a
          href="https://databank.worldbank.org/source/world-development-indicators"
          target="_blank"
          rel="noreferrer"
          title="World Development Indicators (SP.POP.TOTL)"
        >
          World Bank WDI
        </a>{" "}
        (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>)
      </span>
      <span className="sep">•</span>
      <span>
        Elevation (Terrarium tiles):{" "}
        <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noreferrer">
          Mapzen Terrain Tiles on AWS
        </a>{" "}
        (<a
          href="https://tilezen.readthedocs.io/en/latest/attribution/"
          target="_blank"
          rel="noreferrer"
        >
          attribution
        </a>)
      </span>
    </div>
  );
}
