import type { DefaultSize } from "../types.js";

export interface InputOptions {
  /**
   * Etiqueta del input. Aceptamos string (más cómodo) u objeto Lowcoder nativo.
   * El SDK normaliza string → `{ text, align: "left" }` automáticamente.
   */
  label?: string | { text: string; align?: string; width?: string | number };
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: string | boolean;
  hidden?: string | boolean;
  allowClear?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

export const INPUT_SIZE: DefaultSize = { w: 6, h: 6 };

export function inputDSL(opts: InputOptions): Record<string, unknown> {
  // El `label` puede llegar ya normalizado a objeto desde addComponent (label string → object).
  // Si es objeto, lo usamos tal cual. Si es string (caso construyendo el DSL directo
  // con buildDSL), lo envolvemos.
  const labelValue: unknown =
    typeof opts.label === "object" && opts.label !== null
      ? opts.label
      : { text: (opts.label as string) ?? "", align: "left" };
  return {
    label: labelValue,
    placeholder: opts.placeholder ?? "",
    defaultValue: { value: opts.defaultValue ?? "" },
    required: opts.required ?? false,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
    allowClear: opts.allowClear ?? false,
    showCount: opts.showCount ?? false,
    maxLength: opts.maxLength ? { value: opts.maxLength } : { value: "" },
    onEvent: [],
  };
}
