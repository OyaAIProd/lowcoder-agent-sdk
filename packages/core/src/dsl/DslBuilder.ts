import { genGridKey, genQueryId } from "../utils/idGenerator.js";
import { AutoLayout, type ComponentEntry } from "../layout/AutoLayout.js";
import {
  COMPONENT_DEFAULT_SIZES,
  COMPONENT_DSL_MAP,
} from "./components/index.js";
import { QUERY_DSL_MAP } from "./queries/index.js";
import type {
  LowcoderDSL,
  QueryDSL,
  TempStateDSL,
  AppSettingsDSL,
  PreloadDSL,
  ResourceType,
} from "./types.js";

/**
 * IDs especiales de datasources "system static" que Lowcoder reconoce
 * sin necesidad de configurar un datasource real en la instancia.
 * Confirmado en server/api-service/lowcoder-domain/.../Datasource.java
 */
const SYSTEM_STATIC_DATASOURCE_IDS: Partial<Record<ResourceType, string>> = {
  js: "#JS_CODE",
  restApi: "#QUICK_REST_API",
  graphql: "#QUICK_GRAPHQL",
};

export interface QueryEntry {
  id: string;
  type: ResourceType;
  options: Record<string, unknown>;
}

export interface BuildInput {
  title: string;
  components: ComponentEntry[];
  queries: QueryEntry[];
  tempStates?: TempStateDSL[];
  settings?: Partial<AppSettingsDSL>;
  preload?: Partial<PreloadDSL>;
}

export class DslBuilder {
  static build(input: BuildInput): LowcoderDSL {
    // Calcular layout
    const layouts = AutoLayout.compute(input.components, COMPONENT_DEFAULT_SIZES);

    // Construir items y layout del UI
    const items: LowcoderDSL["ui"]["items"] = {};
    const layout: LowcoderDSL["ui"]["layout"] = {};

    for (const comp of input.components) {
      const key = genGridKey();
      const dslFn = COMPONENT_DSL_MAP[comp.compType as keyof typeof COMPONENT_DSL_MAP];
      const compData = dslFn
        ? dslFn(comp.options)
        : comp.options;

      items[key] = {
        compType: comp.compType as LowcoderDSL["ui"]["items"][string]["compType"],
        name: comp.id,
        comp: compData,
      };

      const pos = layouts[comp.id] ?? { x: 0, y: 0, w: 6, h: 5 };
      layout[key] = { i: key, ...pos };
    }

    // Construir queries
    const queries: QueryDSL[] = input.queries.map((q) => {
      const dslFn = QUERY_DSL_MAP[q.type];
      const compData = dslFn ? dslFn(q.options) : q.options;

      // Si no se especifica datasourceId, usar el ID system static por tipo
      const datasourceId =
        (q.options.datasourceId as string) ||
        SYSTEM_STATIC_DATASOURCE_IDS[q.type] ||
        "";

      // Las queries tipo "js" se ejecutan en el navegador (sandbox) por Lowcoder.
      // El detector del frontend chequea si queryId.startsWith("js:"), así que
      // generamos el ID con ese prefijo para que se rutee a la ejecución local.
      // Ver: client/packages/lowcoder/src/comps/queries/queryCompUtils.tsx:37
      const id = q.type === "js" ? `js:${genQueryId()}` : genQueryId();

      return {
        id,
        compType: q.type,
        name: q.id,
        datasourceId,
        triggerType:
          (q.options.triggerType as QueryDSL["triggerType"]) ?? "automatic",
        comp: compData,
        ...(q.options.timeout ? { timeout: q.options.timeout as number } : {}),
      };
    });

    return {
      ui: { items, layout },
      queries,
      tempStates: input.tempStates ?? [],
      transformers: [],
      settings: {
        title: input.title,
        description: input.settings?.description ?? "",
        category: input.settings?.category ?? "Business",
        themeId: input.settings?.themeId ?? "default",
        showHeaderInPublic: input.settings?.showHeaderInPublic ?? true,
        gridColumns: input.settings?.gridColumns ?? 24,
        gridRowHeight: input.settings?.gridRowHeight ?? 8,
        gridPaddingX: input.settings?.gridPaddingX ?? 20,
        gridPaddingY: input.settings?.gridPaddingY ?? 20,
        preventAppStylesOverwriting:
          input.settings?.preventAppStylesOverwriting ?? false,
        maxWidth: input.settings?.maxWidth ?? { dropdown: "1920", input: 0 },
        gridRowCount: input.settings?.gridRowCount ?? "Infinity",
        disableCollision: input.settings?.disableCollision ?? false,
        lowcoderCompVersion: input.settings?.lowcoderCompVersion ?? "latest",
      },
      preload: {
        script: input.preload?.script ?? "",
        css: input.preload?.css ?? "",
        ...(input.preload?.libs ? { libs: input.preload.libs } : {}),
      },
    };
  }
}
