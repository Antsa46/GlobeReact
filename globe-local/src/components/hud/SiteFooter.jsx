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
        paddingTop: open ? 8 : 0,
        paddingBottom: open ? 8 : 0,
      }}
      aria-label="Tietolähteet, lisenssit ja vastuuvapaus"
    >
      {/* Yhteenvetorivi (näkyy aina) */}
      <div className="site-footer__inner" style={{ justifyContent: "space-between" }}>
        <div
          className="site-footer__summary"
          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          <strong style={{ marginRight: 10 }}>Lähteet:</strong>
          <span>
            Borders, countries &amp; cities:{" "}
            <a
              href="https://www.naturalearthdata.com/about/terms-of-use/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Natural Earth (Public Domain)
            </a>
          </span>
          <span className="sep"> &nbsp;•&nbsp; </span>
          <span>
            Population (countries):{" "}
            <a
              href="https://datacatalog.worldbank.org/search/dataset/0037712/World-Development-Indicators"
              target="_blank"
              rel="noopener noreferrer"
            >
              World Bank WDI
            </a>{" "}
            (CC&nbsp;BY&nbsp;4.0)
          </span>
          <span className="sep"> &nbsp;•&nbsp; </span>
          <span>
            City lookups: Wikipedia Geosearch; population:{" "}
            <a
              href="https://www.wikidata.org/wiki/Wikidata:Licensing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikidata (CC0)
            </a>
          </span>
          <span className="sep"> &nbsp;•&nbsp; </span>
          <span>
            Elevation:{" "}
            <a
              href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mapzen Terrain Tiles on AWS
            </a>
          </span>
          <span className="sep"> &nbsp;•&nbsp; </span>
          {/* UUSI: lyhyt vastuumuistutus yhteenvetoriville */}
          <span style={{ opacity: 0.8 }}>Suuntaa-antava data</span>
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
            padding: "4px 8px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          title={open ? "Sulje lisätiedot" : "Näytä lisätiedot"}
        >
          {open ? "Sulje lisätiedot" : "Lisenssit, lähteet & vastuu"}
        </button>
      </div>

      {/* Laajennettu paneeli (näkyy vain kun open) */}
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
              <strong>Natural Earth</strong> – rajat, maat &amp; kaupungit. Julkinen domain.
              Suositus: “Made with Natural Earth”.{" "}
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
              <strong>World Bank – World Development Indicators (WDI)</strong> – maiden
              väkiluvut. Lisenssi: CC BY 4.0 (vaatii lähdemaininnan).{" "}
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
              <strong>Wikidata</strong> – kaupunkien väkiluvut (P1082) ja ajankohta (P585), lisenssi CC0.{" "}
              <a
                href="https://www.wikidata.org/wiki/Wikidata:Licensing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Licensing
              </a>
              . Lisäksi hyödynnämme <strong>Wikipedia Geosearch</strong> -rajapintaa QID:ien paikantamiseen
              (ei Wikipedia-tekstin näyttöä).
            </li>
            <li>
              <strong>Elevation (Terrarium tiles)</strong> –{" "}
              <a
                href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mapzen Terrain Tiles on AWS
              </a>
              .
            </li>
          </ul>

          {/* UUSI: selkeä vastuuvapauslauseke */}
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              opacity: 0.9,
            }}
          >
            <strong>Vastuuvapaus:</strong> Tämä sovellus ja sen data ovat suuntaa-antavia ja
            toimitetaan “sellaisinaan” ilman mitään takuuta. Tiedot voivat olla
            puutteellisia, vanhentuneita tai virheellisiä (esim. rajaukset,
            väkiluvut, ajoitus). Älä käytä turvallisuus- tai viranomais-
            kriittisiin tarkoituksiin.
          </div>
        </div>
      )}
    </footer>
  );
}
