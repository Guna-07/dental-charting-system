import { Fragment } from "react";
import { Text } from "@mantine/core";

import {
  PERIO_SITES,
  SITE_ABBREV,
  SITE_MEASURE_ROWS,
  type PerioAspect,
} from "@/constants/dental/periodontal";
import { toothMeta } from "@/constants/dental/teeth";

import { MeasurementCell, type CellRowKey } from "./MeasurementCell";
import { MobilitySelector } from "./MobilitySelector";
import { FurcationSelector } from "./FurcationSelector";
import type { GingivalDraft } from "../types/gingival-chart.types";

interface PeriodontalArchProps {
  title: string;
  teeth: string[];
  draft: GingivalDraft;
  setSite: (
    tooth: string,
    aspect: PerioAspect,
    site: (typeof PERIO_SITES)[number],
    field: "pd" | "gm" | "bop" | "plaque" | "suppuration",
    value: number | boolean | null,
  ) => void;
  setTooth: (
    tooth: string,
    field: "mobility" | "furcation" | "notes",
    value: number | string | null,
  ) => void;
}

const thStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  padding: "2px 3px",
  textAlign: "center",
  color: "var(--mantine-color-gray-6)",
  whiteSpace: "nowrap",
};

const labelCellStyle: React.CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  background: "var(--mantine-color-body)",
  fontSize: 11,
  fontWeight: 600,
  padding: "3px 10px 3px 4px",
  whiteSpace: "nowrap",
  borderRight: "1px solid var(--mantine-color-gray-3)",
};

export function PeriodontalArch({
  title,
  teeth,
  draft,
  setSite,
  setTooth,
}: PeriodontalArchProps) {
  return (
    <div>
      <Text fw={700} size="sm" mb={4}>
        {title}
      </Text>
      <div className="perio-scroll" style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={labelCellStyle} />
              {teeth.map((t) => (
                <th key={t} colSpan={3} style={{ ...thStyle, fontSize: 11 }}>
                  {t}
                </th>
              ))}
            </tr>
            <tr>
              <th style={labelCellStyle} />
              {teeth.map((t) =>
                PERIO_SITES.map((s) => (
                  <th key={`${t}-${s}`} style={thStyle}>
                    {SITE_ABBREV[s]}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {(["buccal", "lingual"] as PerioAspect[]).map((aspect) => (
              <Fragment key={aspect}>
                <tr>
                  <td
                    style={{
                      ...labelCellStyle,
                      textTransform: "uppercase",
                      color: "var(--mantine-color-teal-7)",
                      paddingTop: 8,
                    }}
                  >
                    {aspect === "buccal" ? "Facial / Buccal" : "Lingual / Palatal"}
                  </td>
                  <td colSpan={teeth.length * 3} />
                </tr>
                {SITE_MEASURE_ROWS.map((row) => (
                  <tr key={`${aspect}-${row.key}`}>
                    <td style={labelCellStyle}>{row.label}</td>
                    {teeth.map((t) =>
                      PERIO_SITES.map((site) => (
                        <td
                          key={`${t}-${site}`}
                          style={{ padding: 1, textAlign: "center" }}
                        >
                          <MeasurementCell
                            rowKey={row.key as CellRowKey}
                            tooth={t}
                            aspect={aspect}
                            site={site}
                            measurement={draft[t][aspect][site]}
                            range={"range" in row ? row.range : { min: 0, max: 0 }}
                            onNumber={(field, value) =>
                              setSite(t, aspect, site, field, value)
                            }
                            onToggle={(field) =>
                              setSite(
                                t,
                                aspect,
                                site,
                                field,
                                !draft[t][aspect][site][field],
                              )
                            }
                          />
                        </td>
                      )),
                    )}
                  </tr>
                ))}
              </Fragment>
            ))}

            <tr>
              <td style={{ ...labelCellStyle, paddingTop: 8 }}>Mobility</td>
              {teeth.map((t) => (
                <td key={t} colSpan={3} style={{ textAlign: "center", padding: 1 }}>
                  <MobilitySelector
                    value={draft[t].mobility}
                    ariaLabel={`Tooth ${t} mobility`}
                    onChange={(v) => setTooth(t, "mobility", v)}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td style={labelCellStyle}>Furcation</td>
              {teeth.map((t) => (
                <td key={t} colSpan={3} style={{ textAlign: "center", padding: 1 }}>
                  <FurcationSelector
                    value={draft[t].furcation}
                    disabled={!toothMeta(t).hasFurcation}
                    ariaLabel={`Tooth ${t} furcation`}
                    onChange={(v) => setTooth(t, "furcation", v)}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Text size="10px" c="dimmed" mt={4}>
        PD 0–{15} mm · GM recession −5–10 mm · CAL = PD + GM (computed) · Mobility
        / Furcation 0–3
      </Text>
    </div>
  );
}
