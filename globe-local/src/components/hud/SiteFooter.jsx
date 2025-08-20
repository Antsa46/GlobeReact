// src/components/hud/SiteFooter.jsx
import React, { useState } from "react";

export default function SiteFooter() {
  const [open, setOpen] = useState(false);

  return (
    <footer
      className="site-footer"
      style={{
        height: open ? "auto" : "var(--footer-h)",
        display: open ? "block" : "flex",
        overflow: open ? "auto" : "hidden",
        paddingTop: open ? 6 : 0,
        paddingBottom: open ? 6 : 0,
      }}
      aria-label="Tietolähteet, lisenssit ja vastuuvapaus"
    >
      {/* tiivis yhteenvetorivi */}
      <div
        className="site-footer__inner"
        style={{
          justifyContent: "space-between",
          gap: 8,
          fontSize: "clamp(9px, 0.85vw, 11px)",   // vielä pykälä pienempi
          lineHeight: 1.1,
        }}
      >
        <div
          className="site-footer__summary"
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title="Yhteenveto käytetyistä aineistoista ja lisensseistä"
        >
          <strong style={{ marginRight: 8 }}>Lähteet:</strong>

          {/* Lyhyet nimet + tooltipit täyteen muotoon */}
          <span title="Borders, countries & cities: Natural Earth (Public Domain)">
            <a
              href="https://www.naturalearthdata.com/about/terms-of-use/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NE (PD)
            </a>
          </span>

          <span className="sep"> • </span>

          <span title="World Bank – World Development Indicators (CC BY 4.0)">
            <a
              href="https://datacatalog.worldbank.org/search/dataset/0037712/World-Development-Indicators"
              target="_blank"
              rel="noopener noreferrer"
            >
              WDI (CC BY 4.0)
            </a>
          </span>

          <span className="sep"> • </span>

          <span title="City lookups via Wikipedia Geosearch; population from Wikidata (CC0)">
            <a
              href="https://www.wikidata.org/wiki/Wikidata:Licensing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia+Wikidata (CC0)
            </a>
          </span>

          <span className="sep"> • </span>

          <span title="Elevation: Mapzen Terrain Tiles on AWS">
            <a
              href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mapzen Terrain (AWS)
            </a>
          </span>

          <span className="sep"> • </span>
          <span style={{ opacity: 0.8 }}>Suuntaa-antava</span>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="attributions-panel"
          style={{
            background: "transparent",
            color: "#cfe1ff",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 6,
            padding: "3px 8px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontSize: "clamp(9px, 0.85vw, 11px)",
          }}
          title={open ? "Sulje lisätiedot" : "Näytä lisätiedot"}
        >
          {open ? "Sulje lisätiedot" : "Lisenssit, lähteet & vastuu"}
        </button>
      </div>

      {/* laajennettu paneeli */}
      {open && (
        <div
          id="attributions-panel"
          style={{
            maxWidth: 1200,
            margin: "8px auto 0 auto",
            padding: "0 12px 8px 12px",
            fontSize: 13,
            lineHeight: 1.4,
            opacity: 0.95,
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              <strong>Natural Earth</strong> – rajat, maat &amp; kaupungit (Public Domain).{" "}
              <a
                href="https://www.naturalearthdata.com/about/terms-of-use/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of use
              </a>
              .
            </li>
            <li>
              <strong>World Bank – WDI</strong> – maiden väkiluvut (CC BY 4.0).{" "}
              <a
                href="https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets"
                target="_blank"
                rel="noopener noreferrer"
              >
                License
              </a>
              .
            </li>
            <li>
              <strong>Wikidata</strong> – kaupunkien väkiluvut (P1082) &amp; ajankohta (P585), CC0.{" "}
              <a
                href="https://www.wikidata.org/wiki/Wikidata:Licensing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Licensing
              </a>
              . Wikipedia Geosearchia käytetään vain QID-paikannukseen.
            </li>
            <li>
              <strong>Mapzen Terrain Tiles (AWS)</strong> –{" "}
              <a
                href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                attribution
              </a>
              .
            </li>
          </ul>

          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              opacity: 0.9,
            }}
          >
            <strong>Vastuuvapaus:</strong> data on suuntaa-antavaa ja voi olla
            puutteellista tai vanhentunutta. Ei turvallisuus- tai viranomaiskäyttöön.
          </div>
        </div>
      )}
    </footer>
  );
}
