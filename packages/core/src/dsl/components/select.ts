import type { DefaultSize } from "../types.js";

export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Configuración para options dinámicas desde una query (auto-map).
 * El SDK lo traduce al formato esperado por Lowcoder:
 * `{ optionType: "map", mapData: { data: "{{query.data}}", mapData: { label: "{{item.x}}", value: "{{item.y}}" } } }`.
 */
export interface SelectOptionsMap {
  /** Binding al array de datos, ej: `"{{loadUsers.data}}"`. */
  data: string;
  /** Expresión para el label de cada opción, ej: `"{{item.name}}"`. */
  label: string;
  /** Expresión para el value de cada opción, ej: `"{{item.id}}"`. */
  value: string;
}

export interface SelectOptions {
  label?: string;
  placeholder?: string;
  /** Options manuales (array) o auto-map desde query (objeto `{data,label,value}`). */
  options?: SelectOption[] | SelectOptionsMap;
  defaultValue?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  disabled?: string | boolean;
  hidden?: string | boolean;
}

export const SELECT_SIZE: DefaultSize = { w: 6, h: 5 };

export function selectDSL(opts: SelectOptions): Record<string, unknown> {
  // Construye el bloque options según formato Lowcoder.
  // Modo manual: opciones hardcoded en el DSL.
  // Modo map: bindings dinámicos desde una query.
  let optionType: "manual" | "map" = "manual";
  let manual: SelectOption[] = [];
  let mapData: { data: string; mapData: { label: string; value: string } } | undefined;

  if (Array.isArray(opts.options)) {
    optionType = "manual";
    manual = opts.options;
  } else if (opts.options && typeof opts.options === "object" && "data" in opts.options) {
    optionType = "map";
    mapData = {
      data: opts.options.data,
      mapData: { label: opts.options.label, value: opts.options.value },
    };
  } else {
    optionType = "manual";
    manual = [];
  }

  return {
    label: { text: opts.label ?? "", align: "left" },
    placeholder: opts.placeholder ?? "",
    options: {
      optionType,
      manual: { manual },
      ...(mapData ? { mapData } : {}),
    },
    defaultValue: { value: opts.defaultValue ?? "" },
    allowClear: opts.allowClear ?? false,
    showSearch: opts.showSearch ?? false,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
    onEvent: [],
  };
}
