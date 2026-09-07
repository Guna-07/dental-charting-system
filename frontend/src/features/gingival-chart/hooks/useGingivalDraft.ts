import { useCallback, useMemo, useReducer } from "react";

import { PERIO_SITES, type PerioAspect, type PerioSite } from "@/constants/dental/periodontal";
import { PERMANENT_TEETH } from "@/constants/dental/teeth";

import type {
  GingivalChart,
  GingivalChartUpdate,
  GingivalDraft,
  SiteMeasurement,
  ToothPerioDraft,
} from "../types/gingival-chart.types";

const emptySite = (): SiteMeasurement => ({
  pd: null,
  gm: null,
  bop: false,
  plaque: false,
  suppuration: false,
});

const emptyTooth = (): ToothPerioDraft => ({
  buccal: { mesial: emptySite(), mid: emptySite(), distal: emptySite() },
  lingual: { mesial: emptySite(), mid: emptySite(), distal: emptySite() },
  mobility: null,
  furcation: null,
  notes: "",
});

/** Build a full editable draft (every permanent tooth) from the server chart. */
export function chartToDraft(chart?: GingivalChart): GingivalDraft {
  const draft: GingivalDraft = {};
  for (const tooth of PERMANENT_TEETH) {
    const base = emptyTooth();
    const server = chart?.teeth?.[tooth];
    if (server) {
      for (const aspect of ["buccal", "lingual"] as PerioAspect[]) {
        for (const site of PERIO_SITES) {
          const s = server[aspect]?.[site];
          if (s) {
            base[aspect][site] = {
              pd: s.pd ?? null,
              gm: s.gm ?? null,
              bop: Boolean(s.bop),
              plaque: Boolean(s.plaque),
              suppuration: Boolean(s.suppuration),
            };
          }
        }
      }
      base.mobility = server.mobility ?? null;
      base.furcation = server.furcation ?? null;
      base.notes = server.notes ?? "";
    }
    draft[tooth] = base;
  }
  return draft;
}

const siteHasData = (s: SiteMeasurement) =>
  s.pd !== null || s.gm !== null || s.bop || s.plaque || s.suppuration;

const toothHasData = (t: ToothPerioDraft) =>
  PERIO_SITES.some((site) => siteHasData(t.buccal[site]) || siteHasData(t.lingual[site])) ||
  t.mobility !== null ||
  t.furcation !== null ||
  t.notes.trim() !== "";

/** Reduce a draft to the PUT payload, omitting teeth/sites with no data. */
export function draftToUpdate(draft: GingivalDraft): GingivalChartUpdate {
  const teeth: GingivalChartUpdate["teeth"] = {};
  for (const [tooth, data] of Object.entries(draft)) {
    if (!toothHasData(data)) continue;
    const pick = (aspect: PerioAspect) =>
      Object.fromEntries(
        PERIO_SITES.filter((site) => siteHasData(data[aspect][site])).map(
          (site) => [site, data[aspect][site]],
        ),
      );
    teeth[tooth] = {
      buccal: pick("buccal"),
      lingual: pick("lingual"),
      mobility: data.mobility,
      furcation: data.furcation,
      notes: data.notes,
    };
  }
  return { teeth };
}

// ---- reducer ----

type Action =
  | { type: "init"; draft: GingivalDraft }
  | {
      type: "setSite";
      tooth: string;
      aspect: PerioAspect;
      site: PerioSite;
      field: keyof SiteMeasurement;
      value: number | boolean | null;
    }
  | {
      type: "setTooth";
      tooth: string;
      field: "mobility" | "furcation" | "notes";
      value: number | string | null;
    };

interface State {
  draft: GingivalDraft;
  baseline: string;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init": {
      return { draft: action.draft, baseline: JSON.stringify(action.draft) };
    }
    case "setSite": {
      const tooth = state.draft[action.tooth];
      const next: GingivalDraft = {
        ...state.draft,
        [action.tooth]: {
          ...tooth,
          [action.aspect]: {
            ...tooth[action.aspect],
            [action.site]: {
              ...tooth[action.aspect][action.site],
              [action.field]: action.value,
            },
          },
        },
      };
      return { ...state, draft: next };
    }
    case "setTooth": {
      const next: GingivalDraft = {
        ...state.draft,
        [action.tooth]: { ...state.draft[action.tooth], [action.field]: action.value },
      };
      return { ...state, draft: next };
    }
    default:
      return state;
  }
}

export function useGingivalDraft(chart?: GingivalChart) {
  const [state, dispatch] = useReducer(reducer, undefined as unknown as State, () => {
    const draft = chartToDraft(chart);
    return { draft, baseline: JSON.stringify(draft) };
  });

  const reinit = useCallback((c?: GingivalChart) => {
    dispatch({ type: "init", draft: chartToDraft(c) });
  }, []);

  const setSite = useCallback(
    (
      tooth: string,
      aspect: PerioAspect,
      site: PerioSite,
      field: keyof SiteMeasurement,
      value: number | boolean | null,
    ) => dispatch({ type: "setSite", tooth, aspect, site, field, value }),
    [],
  );

  const setTooth = useCallback(
    (tooth: string, field: "mobility" | "furcation" | "notes", value: number | string | null) =>
      dispatch({ type: "setTooth", tooth, field, value }),
    [],
  );

  const isDirty = useMemo(
    () => JSON.stringify(state.draft) !== state.baseline,
    [state.draft, state.baseline],
  );

  return { draft: state.draft, isDirty, reinit, setSite, setTooth };
}
