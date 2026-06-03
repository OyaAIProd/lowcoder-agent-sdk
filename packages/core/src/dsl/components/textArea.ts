import type { DefaultSize } from "../types.js";

export interface TextAreaOptions {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: string | boolean;
  hidden?: string | boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
}

export const TEXT_AREA_SIZE: DefaultSize = { w: 6, h: 24 };

export function textAreaDSL(opts: TextAreaOptions): Record<string, unknown> {
  return {
    label: { text: opts.label ?? "", align: "left" },
    placeholder: opts.placeholder ?? "",
    defaultValue: { value: opts.defaultValue ?? "" },
    required: opts.required ?? false,
    disabled: opts.disabled ?? false,
    hidden: opts.hidden ?? false,
    autoHeight: "fixed",
    minRows: { value: opts.minRows ?? 3 },
    maxRows: { value: opts.maxRows ?? 6 },
    maxLength: opts.maxLength ? { value: opts.maxLength } : { value: "" },
    onEvent: [],
  };
}
